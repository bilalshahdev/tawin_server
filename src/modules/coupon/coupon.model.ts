import { Schema, model, Document, Types } from 'mongoose';

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
    usedBy: Types.ObjectId[];
    appliesTo: CouponAppliesTo;
    categories: Types.ObjectId[];
    products: Types.ObjectId[];
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    appliesTo: { type: String, enum: ['all', 'category', 'product'], default: 'all' },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', default: [] }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', default: [] }]
}, { timestamps: true });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
