import { Schema, model, Types } from 'mongoose';
import { IReview } from './review.types';
import { Product } from '../product/product.model';

const reviewSchema = new Schema<IReview>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (productId: Types.ObjectId) {
    const stats = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                reviewCount: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].reviewCount
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            reviewCount: 0
        });
    }
};

// Sync rating after saving a new review
reviewSchema.post('save', function () {
    (this.constructor as any).calculateAverageRating(this.product);
});

// Sync rating after updating or deleting a review
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.product);
    }
});

export const Review = model<IReview>('Review', reviewSchema);