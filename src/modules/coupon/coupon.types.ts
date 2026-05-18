import { Document, Types } from 'mongoose';

export type CouponAppliesTo = 'all' | 'category' | 'product';

export interface ICoupon extends Document {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    expiryDate: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    isPromotional: boolean;
    thumbnail?: string;
    usedBy: Types.ObjectId[];
    appliesTo: CouponAppliesTo;
    categories: Types.ObjectId[];
    products: Types.ObjectId[];
}