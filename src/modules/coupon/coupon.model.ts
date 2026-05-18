import { Schema, model } from 'mongoose';
import { ICoupon } from './coupon.types';

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPromotional: { type: Boolean, default: false },
    thumbnail: { type: String, default: '' },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    appliesTo: { type: String, enum: ['all', 'category', 'product'], default: 'all' },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', default: [] }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', default: [] }]
}, { timestamps: true });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
