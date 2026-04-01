import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as reviewService from "./review.service";
import { STATUS_CODE } from "../../config/constants";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.addReview(req.user!.id, req.body);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("review.review_created"), review));
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("review.reviews_retrieved"), reviews));
});

export const removeReview = asyncHandler(async (req: Request, res: Response) => {
    await reviewService.deleteReview(
        req.params.id as string,
        req.user!.id,
        req.user!.role === 'admin'
    );
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("review.review_deleted")));
});