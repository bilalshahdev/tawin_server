import { Coupon } from './coupon.model';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';
import { FilterQuery, Types } from 'mongoose';
import { Cart } from '../cart/cart.model';
import { ICoupon } from './coupon.types';
import { deleteFile } from '../../utils/deleteFile';

// Shape of a cart item once `items.product` is populated.
// `product.category` is the populated category ObjectId or document.
export interface ValidatableCartItem {
    product: {
        _id: Types.ObjectId | string;
        price: number;
        category: Types.ObjectId | string | { _id: Types.ObjectId | string };
    } | any;
    quantity: number;
}

// --- Admin Side ---
export const createCoupon = async (data: any) => {
    return await Coupon.create(data);
};

export const getAllCoupons = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter: FilterQuery<typeof Coupon> = {};
    const { search = "" } = query || {}

    // Search logic for Coupon Code
    if (search) {
        filter.code = { $regex: search, $options: 'i' };
    }

    const [coupons, totalDocs] = await Promise.all([

        Coupon.find(filter)
            .populate('categories', 'name slug')
            .populate('products', 'title price photo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Coupon.countDocuments(filter)])

    return { data: coupons, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };


};

const idToString = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (v._id) return v._id.toString();
    return v.toString();
};

const computeEligibleSubtotal = (coupon: ICoupon, items: ValidatableCartItem[]): number => {
    if (coupon.appliesTo === 'all') {
        return items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
    }

    if (coupon.appliesTo === 'product') {
        const allowed = new Set(coupon.products.map(p => p.toString()));
        return items.reduce((sum, it) => {
            const productId = idToString(it.product?._id);
            return allowed.has(productId) ? sum + it.product.price * it.quantity : sum;
        }, 0);
    }

    // appliesTo === 'category'
    const allowed = new Set(coupon.categories.map(c => c.toString()));
    return items.reduce((sum, it) => {
        const categoryId = idToString(it.product?.category);
        return allowed.has(categoryId) ? sum + it.product.price * it.quantity : sum;
    }, 0);
};

export const validateCoupon = async (
    code: string,
    items: ValidatableCartItem[],
    userId: string,
) => {
    if (!items || items.length === 0) {
        throw new ApiError(400, "errors.cart_empty");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) throw new ApiError(404, "coupon.not_found_or_inactive");

    // Check if THIS specific user has already used it
    const hasUsed = coupon.usedBy.some(id => id.toString() === userId);
    if (hasUsed) {
        throw new ApiError(400, "coupon.already_used");
    }

    if (new Date() > coupon.expiryDate) throw new ApiError(400, "coupon.expired");
    if (coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "coupon.limit_reached");

    const cartTotal = items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
    if (cartTotal < coupon.minOrderAmount) {
        throw new ApiError(400, "coupon.minimum_order_required", { amount: coupon.minOrderAmount });
    }

    const eligibleSubtotal = computeEligibleSubtotal(coupon, items);
    if (eligibleSubtotal <= 0) {
        throw new ApiError(400, "coupon.not_applicable");
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (eligibleSubtotal * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    return {
        coupon,
        discountAmount: Math.min(discountAmount, eligibleSubtotal),
        eligibleSubtotal,
        cartTotal,
    };
};

export const fetchPromotionalCoupon = async () => {
    const coupon = await Coupon.findOne({ isPromotional: true });
    return coupon || null;
};

// --- Stats API ---
export const getCouponStats = async () => {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ expiryDate: { $lt: new Date() } });

    // Aggregation for total usage
    const usageStats = await Coupon.aggregate([
        { $group: { _id: null, totalUsed: { $sum: "$usedCount" } } }
    ]);

    return {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsageCount: usageStats[0]?.totalUsed || 0
    };
};


export const updateCoupon = async (id: string, updateData: any) => {
    const existing = await Coupon.findById(id);
    if (!existing) throw new ApiError(404, "Coupon not found");

    if (updateData.thumbnail && existing.thumbnail && updateData.thumbnail !== existing.thumbnail) {
        deleteFile(existing.thumbnail);
    }

    return await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteCoupon = async (id: string) => {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");

    if (coupon.thumbnail) deleteFile(coupon.thumbnail);
};

export const toggleCouponStatus = async (id: string) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) return null;

    coupon.isActive = !coupon.isActive;
    return await coupon.save();
};

export const togglePromotional = async (id: string) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) return null;

    coupon.isPromotional = !coupon.isPromotional;

    // if this coupon is now promotional, set all other coupons to not promotional
    if (coupon.isPromotional) {
        await Coupon.updateMany({ _id: { $ne: id } }, { isPromotional: false });
    }

    return await coupon.save();
};

// Loads the user's cart with populated products (and product.category) for coupon validation.
export const loadValidatableCart = async (userId: string): Promise<ValidatableCartItem[]> => {
    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'price category title',
    });
    if (!cart) return [];
    return cart.items as unknown as ValidatableCartItem[];
};

