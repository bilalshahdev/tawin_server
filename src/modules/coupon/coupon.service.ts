import { Coupon, ICoupon } from './coupon.model';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';
import { FilterQuery, Types } from 'mongoose';
import { Cart } from '../cart/cart.model';

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
        throw new ApiError(400, "Cart is empty");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) throw new ApiError(404, "Coupon not found or inactive");

    // Check if THIS specific user has already used it
    const hasUsed = coupon.usedBy.some(id => id.toString() === userId);
    if (hasUsed) {
        throw new ApiError(400, "You have already used this coupon");
    }

    if (new Date() > coupon.expiryDate) throw new ApiError(400, "Coupon has expired");
    if (coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "Coupon limit reached");

    const cartTotal = items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
    if (cartTotal < coupon.minOrderAmount) {
        throw new ApiError(400, `Minimum order of ${coupon.minOrderAmount} required`);
    }

    const eligibleSubtotal = computeEligibleSubtotal(coupon, items);
    if (eligibleSubtotal <= 0) {
        throw new ApiError(400, "Coupon is not applicable to items in your cart");
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
    return await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteCoupon = async (id: string) => {
    return await Coupon.findByIdAndDelete(id);
};

export const toggleCouponStatus = async (id: string) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) return null;

    coupon.isActive = !coupon.isActive;
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
