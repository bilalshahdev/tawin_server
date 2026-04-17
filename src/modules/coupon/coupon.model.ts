import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    expiryDate: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    usedBy: Schema.Types.ObjectId[];
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
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Coupon = model<ICoupon>('Coupon', couponSchema);