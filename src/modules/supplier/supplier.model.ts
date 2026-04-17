import { Schema, model, Document } from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    code: string; // Unique Supplier ID
    phone: string;
    email?: string;
    address?: string;
    isActive: boolean;
    suppliedProducts: Schema.Types.ObjectId[];
}

const supplierSchema = new Schema<ISupplier>({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    suppliedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export const Supplier = model<ISupplier>('Supplier', supplierSchema);