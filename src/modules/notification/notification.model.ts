import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
    recipient: Types.ObjectId;
    recipientType: 'User' | 'Staff';
    title: string;
    message: string;
    type: 'order' | 'stock' | 'basket' | 'auth' | 'coupon' | 'promotion' | 'system';
    metadata: {
        orderId?: Types.ObjectId;
        productId?: Types.ObjectId;
        couponId?: Types.ObjectId;
        link?: string;
    };
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientType' },
    recipientType: { type: String, required: true, enum: ['User', 'Staff'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['order', 'stock', 'basket', 'auth', 'coupon', 'promotion', 'system']
    },
    metadata: {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
        link: { type: String }
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', notificationSchema);