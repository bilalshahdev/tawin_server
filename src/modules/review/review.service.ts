import { STATUS_CODE } from "../../config/constants";
import { Period } from "../../types/global.types";
import { ApiError } from "../../utils/apiError";
import { fillBuckets, getTimelineBuckets } from "../../utils/graphHelper";
import { getPaginationOptions } from "../../utils/pagination";
import { User } from "../user/user.model";
import { Review } from "./review.model";
import { IReview } from "./review.types";

export const getReviewStats = async (period: Period = 'monthly') => {
    const buckets = getTimelineBuckets(period);
    const startDate = buckets[0].timestamp;
    const stats = await Review.aggregate([
        {
            $facet: {
                starCounts: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
                totalReviews: [{ $count: "count" }]
            }
        }
    ]);

    const starStats = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    stats[0].starCounts.forEach((item: any) => {
        const rating = item._id.toString();
        if (starStats.hasOwnProperty(rating)) {
            starStats[rating as keyof typeof starStats] = item.count;
        }
    });

    const totalReviews = stats[0].totalReviews[0]?.count || 0;
    const totalVerifiedUsers = await User.countDocuments({ isVerified: true });
    const uniqueReviewersResult = await Review.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "u"
            }
        },
        { $unwind: "$u" },
        { $match: { "u.isVerified": true } },
        { $group: { _id: "$user" } },
        { $count: "count" }
    ]);

    const reviewersCount = uniqueReviewersResult[0]?.count || 0;
    const userReviewRate = totalVerifiedUsers > 0
        ? (reviewersCount / totalVerifiedUsers) * 100
        : 0;

        

    const reviews = await Review.find({
        createdAt: { $gte: startDate }
    }) as unknown as IReview[];

    const graphData = fillBuckets(buckets, reviews, 'createdAt', period);

    return {
        totalReviews,
        totalReviewers: reviewersCount,
        userReviewRate: Number(userReviewRate.toFixed(2)),
        starStats,
        graphData,
        period
    };
};

export const addReview = async (userId: string, data: any) => {
    const existingReview = await Review.findOne({ user: userId, product: data.product });
    if (existingReview) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_reviewed");
    }

    return await Review.create({ ...data, user: userId });
};


export const getAllReviews = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { rating } = query;

    const [reviews, totalDocs] = await Promise.all([
        Review.find(rating ? { rating } : {})
            .populate('user', 'firstName lastName email')
            .populate('product', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments(rating ? { rating } : {})
    ])

    return { data: reviews, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getReviewsByProduct = async (productId: string, query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const [reviews, totalDocs] = await Promise.all([
        Review.find({ product: productId })
            .populate('user', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments({ product: productId })
    ])
    return { data: reviews, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
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