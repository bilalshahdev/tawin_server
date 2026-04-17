import { Document, Types } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string;
}

export interface IProduct extends Omit<Document, 'isNew'> {
    title: LocalizedString;
    slug: string;
    category: Types.ObjectId;
    description?: LocalizedString;
    price: number;
    originalPrice?: number;
    photo?: string;
    images: string[];
    variant?: string;
    remainingPieces: number;
    isNewArrival: boolean;
    isFeatured: boolean;
    discount: number;
    rating: number;
    reviewCount: number;
}