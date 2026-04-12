import { Document, Types } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string;
}

export interface IProduct extends Omit<Document, 'isNew'> {
    title: LocalizedString;
    slug: string;
    category: LocalizedString;
    description?: LocalizedString;
    price: number;
    originalPrice?: number;
    photo?: string;
    images: string[];
    measurements?: string;
    remainingPieces?: number;
    isNewArrival?: boolean;
    discount?: number;
    colors?: string[]; // Array of Hex Codes
    sizes?: string[]; // Array of sizes
    weights?: { unit: string; value: string }[];
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