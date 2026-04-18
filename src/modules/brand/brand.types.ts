import { Document } from 'mongoose';

export interface IBrand extends Document {
    name: {
        en: string;
        ar: string;
    };
    description?: {
        en: string;
        ar: string;
    };
    slug: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}