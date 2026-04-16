import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from './product.types';

const LocalizedSchema = new Schema({
    en: { type: String, required: true },
    ar: { type: String, default: "" }
}, { _id: false });

const weightSchema = new Schema({
    unit: { type: String, enum: ['g', 'kg', 'ml', 'l'], required: true },
    value: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>({
    title: { type: LocalizedSchema, required: true },
    slug: { type: String, unique: true },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: { en: String, ar: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    photo: { type: String, default: null },
    images: [{ type: String, required: true }],
    measurements: { type: String },
    remainingPieces: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
    weights: [weightSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('save', function (next) {
    if (this.isModified('title.en')) {
        this.slug = slugify(this.title.en, { lower: true, strict: true });
    }
    next();
});

productSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const productId = this._id;
    await model('Cart').updateMany(
        { "items.product": productId },
        { $pull: { items: { product: productId } } }
    );
    next();
});

export const Product = model<IProduct>('Product', productSchema);