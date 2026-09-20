import { Document, Types } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string;
}

export interface IProduct extends Omit<Document, 'isNew'> {
    productTag?: string;
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
    isArchived: boolean;
    archivedAt?: Date | null;
    discount: number;
    rating: number;
    reviewCount: number;
}
