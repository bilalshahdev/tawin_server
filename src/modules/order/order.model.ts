import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
    user: Schema.Types.ObjectId;
    items: Array<{
        product: Schema.Types.ObjectId;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    shippingAddress: string;
    phone: string;
    paymentMethod: 'COD';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    couponCode?: string;
}

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    couponCode: { type: String }
}, { timestamps: true });

export const Order = model<IOrder>('Order', orderSchema);