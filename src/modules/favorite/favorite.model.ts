import { Schema, model } from 'mongoose';
import { IFavorite } from './favorite.types';

const favoriteSchema = new Schema<IFavorite>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);