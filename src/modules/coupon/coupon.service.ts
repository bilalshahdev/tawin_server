import { Coupon, ICoupon } from './coupon.model';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';
import { FilterQuery } from 'mongoose';

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

    const [coupons, total] = await Promise.all([

        Coupon.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Coupon.countDocuments(filter)])
    return {
        coupons,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

export const validateCoupon = async (code: string, orderAmount: number, userId: string) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) throw new ApiError(404, "Coupon not found or inactive");

    // Check if THIS specific user has already used it
    const hasUsed = coupon.usedBy.some(id => id.toString() === userId);
    if (hasUsed) {
        throw new ApiError(400, "You have already used this coupon");
    }

    if (new Date() > coupon.expiryDate) throw new ApiError(400, "Coupon has expired");
    if (coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "Coupon limit reached");
    if (orderAmount < coupon.minOrderAmount) {
        throw new ApiError(400, `Minimum order of ${coupon.minOrderAmount} required`);
    }

    const discountAmount = (orderAmount * coupon.value) / 100;
    return { coupon, discountAmount: Math.min(discountAmount, orderAmount) };
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