import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { ICategory, CategoryType } from './category.types';

const LocalizedSchema = new Schema({
    en: { type: String, required: true },
    ar: { type: String, default: "" }
}, { _id: false });

const categorySchema = new Schema<ICategory>({
    name: { type: LocalizedSchema, required: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: LocalizedSchema },
    type: {
        type: String,
        enum: Object.values(CategoryType),
        default: CategoryType.CATEGORY
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        index: true
    },
}, {
    timestamps: true, toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

categorySchema.pre('save', function (next) {
    if (this.isModified('name.en')) {
        this.slug = slugify(this.name.en, { lower: true, strict: true });
    }
    next();
});

export const Category = model<ICategory>('Category', categorySchema);