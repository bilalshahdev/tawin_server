import { Review } from "./review.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";

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

export const deleteReview = async (reviewId: string, userId: string, isAdmin: boolean) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.review_not_found");

    if (review.user.toString() !== userId && !isAdmin) {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.unauthorized");
    }

    await review.deleteOne();
    return review;
};