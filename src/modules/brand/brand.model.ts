import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { IBrand } from './brand.types';

const LocalizedSchema = new Schema({
    en: { type: String, required: true },
    ar: { type: String, default: "" }
}, { _id: false });

const brandSchema = new Schema<IBrand>({
    name: LocalizedSchema,
    description: LocalizedSchema,
    slug: { type: String, unique: true, lowercase: true },
    image: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

brandSchema.pre('save', function (next) {
    if (this.isModified('name.en')) {
        this.slug = slugify(this.name.en, { lower: true, strict: true });
    }
    next();
});

export const Brand = model<IBrand>('Brand', brandSchema);