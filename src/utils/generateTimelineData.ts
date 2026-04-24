
import { eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval, format, isSameDay, isSameHour, isSameMonth, subDays, subHours, subMonths } from "date-fns";
import { Review } from "../modules/review/review.model";
import { IReview } from "../modules/review/review.types";
import { Period } from "../types/global.types";

export async function generateTimelineData(filter: Period) {
    const now = new Date();
    let start: Date;
    let intervals: Date[];
    let dateFormat: string;

    if (filter === 'daily') {
        start = subHours(now, 23);
        intervals = eachHourOfInterval({ start, end: now });
        dateFormat = "HH:00";
    } else if (filter === 'weekly') {
        start = subDays(now, 6);
        intervals = eachDayOfInterval({ start, end: now });
        dateFormat = "EEE";
    } else if (filter === 'monthly') {
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
            if (filter === 'daily') return isSameHour(rev.createdAt, interval);
            if (filter === 'monthly') return isSameMonth(rev.createdAt, interval);
            if (filter === 'weekly') return isSameDay(rev.createdAt, interval);
            if (filter === 'yearly') return isSameMonth(rev.createdAt, interval);
            if (filter === 'all-time') return true;
            return isSameDay(rev.createdAt, interval);
        }).length;

        return {
            label: format(interval, dateFormat),
            count
        };
    });
}