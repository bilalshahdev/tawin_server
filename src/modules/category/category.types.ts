import { Document, Types } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string;
}

export enum CategoryType {
    CATEGORY = 'category',
    SUB_CATEGORY = 'subCategory'
}

export interface ICategory extends Document {
    name: LocalizedString;
    slug: string;
    thumbnail?: string;
    icon?: string;
    description?: LocalizedString;
    type: CategoryType;
    parentCategory?: Types.ObjectId;
    isActive: boolean;
}