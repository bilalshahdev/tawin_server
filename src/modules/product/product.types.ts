import { Document, Types } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string; // Optional for the first request
}

export interface IProduct extends Omit<Document, 'isNew'> {
    title: LocalizedString;
    slug: string;
    category: LocalizedString;
    description?: LocalizedString;
    price: number;
    originalPrice?: number;
    image: string;
    measurements?: string;
    colors?: string[];
    remainingPieces?: number;
    isNewArrival?: boolean;
    discount?: number;
    rating?: number;
    reviewCount: number;
}

export interface IReview extends Document {
    productId: Types.ObjectId;
    userId: Types.ObjectId;
    name: LocalizedString;
    rating: number;
    comment: LocalizedString;
    avatar?: string;
    date: Date;
}