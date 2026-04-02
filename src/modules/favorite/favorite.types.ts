import { Document, Types } from 'mongoose';

export interface IFavorite extends Document {
    user: Types.ObjectId;
    product: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}