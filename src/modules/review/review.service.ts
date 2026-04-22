import { Review } from "./review.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { getPaginationOptions } from "../../utils/pagination";
import { User } from "../user/user.model";
import {
    subHours, eachHourOfInterval,
    subDays, eachDayOfInterval,
    subMonths, eachMonthOfInterval,
    format, isSameHour, isSameDay, isSameMonth
} from "date-fns";
import { IReview } from "./review.types";

export const getReviewStats = async (filter: 'day' | 'week' | 'month' | 'year' = 'month') => {
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

    const graphData = await generateTimelineData(filter);

    return {
        totalReviews,
        totalReviewers: reviewersCount,
        userReviewRate: Number(userReviewRate.toFixed(2)),
        starStats,
        graphData,
        filter
    };
};

async function generateTimelineData(filter: string) {
    const now = new Date();
    let start: Date;
    let intervals: Date[];
    let dateFormat: string;

    if (filter === 'day') {
        start = subHours(now, 23);
        intervals = eachHourOfInterval({ start, end: now });
        dateFormat = "HH:00";
    } else if (filter === 'week') {
        start = subDays(now, 6);
        intervals = eachDayOfInterval({ start, end: now });
        dateFormat = "EEE";
    } else if (filter === 'month') {
        start = subDays(now, 29);
        intervals = eachDayOfInterval({ start, end: now });
        dateFormat = "dd MMM";
    } else {
        start = subMonths(now, 11);
        intervals = eachMonthOfInterval({ start, end: now });
        dateFormat = "MMM yyyy";
    }

    const reviews = await Review.find({
        createdAt: { $gte: start }
    }).select('createdAt') as unknown as IReview[];

    return intervals.map(interval => {
        const count = reviews.filter(rev => {
            if (filter === 'day') return isSameHour(rev.createdAt, interval);
            if (filter === 'year') return isSameMonth(rev.createdAt, interval);
            return isSameDay(rev.createdAt, interval);
        }).length;

        return {
            label: format(interval, dateFormat),
            count
        };
    });
}

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