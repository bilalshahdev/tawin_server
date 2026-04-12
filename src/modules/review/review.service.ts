import { Review } from "./review.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { getPaginationOptions } from "../../utils/pagination";

export const addReview = async (userId: string, data: any) => {
    const existingReview = await Review.findOne({ user: userId, product: data.product });
    if (existingReview) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_reviewed");
    }

    return await Review.create({ ...data, user: userId });
};

export const getReviewsByProduct = async (productId: string) => {
    return await Review.find({ product: productId })
        .populate('user', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .lean();
};

// Admin Moderation: Get all reviews with pagination
export const getAllReviews = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const reviews = await Review.find()
        .populate('user', 'firstName lastName email')
        .populate('product', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Review.countDocuments();
    return { data: reviews, meta: { total, page, limit } };
};

export const deleteReview = async (reviewId: string, userId: string, isAdmin: boolean) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.review_not_found");

    if (review.user.toString() !== userId && !isAdmin) {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.unauthorized");
    }

    await review.deleteOne();
    return review;
};