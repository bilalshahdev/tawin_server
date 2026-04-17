import { Schema, model, Document } from 'mongoose';

export interface ISupplyLog extends Document {
    supplier: Schema.Types.ObjectId;
    product: Schema.Types.ObjectId;
    quantity: number;
    unit: 'piece' | 'ton';
    sacksCount?: number;
    note?: string;
}

const supplyLogSchema = new Schema<ISupplyLog>({
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['piece', 'ton'], required: true },
    sacksCount: { type: Number },
    note: { type: String }
}, { timestamps: true });

export const SupplyLog = model<ISupplyLog>('SupplyLog', supplyLogSchema);