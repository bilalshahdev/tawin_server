import mongoose, { FilterQuery } from 'mongoose';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';
import { Address } from '../address/address.model';
import { Cart } from '../cart/cart.model';
import { Coupon } from '../coupon/coupon.model';
import { validateCoupon } from '../coupon/coupon.service';
import { Order } from './order.model';
import { type } from 'os';

export const placeOrder = async (userId: string, orderData: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Fetch Address (Ensure it belongs to the user)
        const userAddress = await Address.findOne({ _id: orderData.addressId, user: userId });
        if (!userAddress) throw new ApiError(404, "Address not found or unauthorized");

        const addressSnapshot = {
            label: userAddress.label,
            street: userAddress.street,
            city: userAddress.city,
            state: userAddress.state,
            zipCode: userAddress.zipCode,
            country: userAddress.country
        };

        // 2. Fetch Cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

        let totalAmount = 0;
        const orderItems = [];

        // 3. Process Items & Update Stock
        for (const item of cart.items) {
            const product = item.product as any;
            if (!product) throw new ApiError(404, "One of the products in your cart no longer exists");

            if (product.remainingPieces < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.title.en}`);
            }

            product.remainingPieces -= item.quantity;
            await product.save({ session });

            totalAmount += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // 4. Handle Coupon
        let discountAmount = 0;
        if (orderData.couponCode) {
            const { coupon, discountAmount: disc } = await validateCoupon(orderData.couponCode, orderData.type as 'fixed' | 'percentage', totalAmount, userId);
            discountAmount = disc;
            await Coupon.findByIdAndUpdate(
                coupon._id,
                { $inc: { usedCount: 1 }, $push: { usedBy: userId } },
                { session }
            );
        }

        // 5. Create Order
        const order = await Order.create([{
            user: userId,
            items: orderItems,
            totalAmount,
            discountAmount,
            finalAmount: totalAmount - discountAmount,
            shippingAddress: addressSnapshot,
            phone: orderData.phone || "",
            paymentMethod: orderData.paymentMethod || 'COD',
            couponCode: orderData.couponCode
        }], { session });

        // 6. Clear Cart
        await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });

        await session.commitTransaction();
        return order[0];
    } catch (e) {
        await session.abortTransaction();
        throw e;
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

export const updateStatus = async (id: string, status: string) =>
    Order.findByIdAndUpdate(id, { status }, { new: true });

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