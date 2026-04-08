import { Schema, model, Types } from 'mongoose';

export interface IAddress {
    user: Types.ObjectId;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    isDefault: boolean;
}

const addressSchema = new Schema<IAddress>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const Address = model<IAddress>('Address', addressSchema);