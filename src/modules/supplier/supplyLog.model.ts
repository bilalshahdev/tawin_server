import { Schema, model, Document } from 'mongoose';

export interface ISupplyLog extends Document {
    supplier: Schema.Types.ObjectId;
    product: Schema.Types.ObjectId;

    supplierQuantity: number;
    supplierUnit: 'ton' | 'piece';
    stockIncrement: number;

    costPrice: number;
    sacksCount?: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

const supplyLogSchema = new Schema<ISupplyLog>({
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplierQuantity: { type: Number, required: true },
    supplierUnit: { type: String, enum: ['piece', 'ton'], required: true },
    stockIncrement: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    sacksCount: { type: Number },
    note: { type: String }
}, { timestamps: true });

export const SupplyLog = model<ISupplyLog>('SupplyLog', supplyLogSchema);