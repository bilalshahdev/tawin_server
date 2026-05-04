import mongoose, { FilterQuery } from 'mongoose';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';
import { Address } from '../address/address.model';
import { Cart } from '../cart/cart.model';
import { Coupon } from '../coupon/coupon.model';
import { validateCoupon } from '../coupon/coupon.service';
import { Order } from './order.model';
import * as notificationService from '../notification/notification.service';
import { STATUS_CODE } from '../../config/constants';

export const getOrderStats = async () => {
    const stats = await Order.aggregate([
        {
            $facet: {
                statusCounts: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 }
                        }
                    }
                ],
                totalOrders: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const result = stats[0];
    const statusMap: any = {};

    ['pending', 'delivered', 'canceled', 'processing', 'shipped'].forEach(s => statusMap[s] = 0);

    result.statusCounts.forEach((item: any) => {
        statusMap[item._id] = item.count;
    });

    return {
        total: result.totalOrders[0]?.count || 0,
        pending: statusMap.pending,
        delivered: statusMap.delivered,
        canceled: statusMap.canceled,
        processing: statusMap.processing,
        shipped: statusMap.shipped,
    };
};

export const placeOrder = async (userId: string, orderData: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch and Verify Address
        const userAddress = await Address.findOne({ _id: orderData.addressId, user: userId });
        if (!userAddress) {
            throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.address_not_found");
        }

        const addressSnapshot = {
            label: userAddress.label,
            street: userAddress.street,
            city: userAddress.city,
            state: userAddress.state,
            zipCode: userAddress.zipCode,
            country: userAddress.country
        };

        // 2. Fetch and Verify Cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.cart_empty");
        }

        let totalAmount = 0;
        const orderItems = [];

        // 3. Process Items & Update Stock
        for (const item of cart.items) {
            const product = item.product as any;
            if (!product) {
                throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
            }

            if (product.remainingPieces < item.quantity) {
                throw new ApiError(STATUS_CODE.BAD_REQUEST, `Insufficient stock for ${product.title.en}`);
            }

            // Decrement stock within the transaction
            product.remainingPieces -= item.quantity;
            await product.save({ session });

            totalAmount += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // 4. Handle Coupon Validation and Usage
        let discountAmount = 0;
        if (orderData.couponCode) {
            const { coupon, discountAmount: calculatedDiscount } = await validateCoupon(
                orderData.couponCode,
                cart.items as any,
                userId,
            );

            discountAmount = calculatedDiscount;

            await Coupon.findByIdAndUpdate(
                coupon._id,
                { $inc: { usedCount: 1 }, $push: { usedBy: userId } },
                { session }
            );
        }

        // 5. Create the Order document
        const orderResult = await Order.create([{
            user: userId,
            items: orderItems,
            totalAmount,
            discountAmount,
            finalAmount: totalAmount - discountAmount,
            shippingAddress: addressSnapshot,
            shippingType: orderData?.shippingType || 'free',
            phone: orderData.phone || "",
            paymentMethod: orderData.paymentMethod || 'COD',
            couponCode: orderData.couponCode
        }], { session });

        const finalOrder = orderResult[0];

        // 6. Clear the User's Cart
        await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });

        // Commit all changes
        await session.commitTransaction();

        // ---------------------------------------------------------
        // POST-TRANSACTION NOTIFICATIONS
        // ---------------------------------------------------------

        // A. Notify Admins about the New Order
        await notificationService.notifyAdmins({
            title: 'NOTIF_NEW_ORDER_TITLE',
            message: 'NOTIF_NEW_ORDER_MSG',
            type: 'order',
            metadata: { orderId: finalOrder._id }
        });

        // B. Notify the Customer about their placement
        await notificationService.createNotification({
            recipient: finalOrder.user,
            recipientType: 'User',
            title: 'NOTIF_ORDER_PLACED_TITLE',
            message: 'NOTIF_ORDER_PLACED_MSG',
            type: 'order',
            metadata: { orderId: finalOrder._id }
        });

        if (finalOrder.couponCode) {
            await notificationService.notifyAdmins({
                title: 'NOTIF_COUPON_USAGE_TITLE',
                message: 'NOTIF_COUPON_USAGE_MSG',
                type: 'coupon',
                metadata: { orderId: finalOrder._id }
            });
        }

        return finalOrder;

    } catch (error) {
        // Rollback all changes if any step fails
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getOrders = async (query: any, userId?: string) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter: FilterQuery<typeof Order> = {};

    if (userId) filter.user = userId;
    if (query.status) filter.status = query.status;


    const [orders, totalDocs] = await Promise.all([
        Order.find(filter).populate([
            {
                path: 'user',
                select: 'firstName lastName profileImage'
            },
            {
                path: 'items.product',
                select: 'title photo price'
            }
        ]).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter)
    ]);

    return { data: orders, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getOrderDetails = async (id: string, userId?: string) => {
    const filter: any = { _id: id };
    if (userId) filter.user = userId;
    return await Order.findOne(filter).populate('items.product user');
};

export const updateStatus = async (id: string, status: string) => {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (order) {
        await notificationService.createNotification({
            recipient: order.user as any,
            recipientType: 'User',
            title: 'NOTIF_ORDER_UPDATE_TITLE',
            message: `NOTIF_ORDER_${status.toUpperCase()}_MSG`,
            type: 'order',
            metadata: { orderId: order._id as any }
        });
    }

    return order;
};

export const getAllOrders = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter: FilterQuery<typeof Order> = {};

    if (query.status) filter.status = query.status;
    if (query.user) filter.user = query.user;

    const [orders, total] = await Promise.all([
        Order.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter)
    ]);

    return { orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

export const deleteOrder = async (id: string) => Order.findByIdAndDelete(id);