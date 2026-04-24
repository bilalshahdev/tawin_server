import {
    eachDayOfInterval,
    eachHourOfInterval,
    eachMonthOfInterval,
    format,
    subDays,
    subHours,
    subMonths
} from "date-fns";
import { Period } from "../types/global.types";

export interface GraphBucket {
    label: string;
    timestamp: Date;
    count: number;
}

export const getTimelineBuckets = (period: Period): GraphBucket[] => {
    const now = new Date();
    let start: Date;
    let intervals: Date[];
    let dateFormat: string;

    switch (period) {
        case 'daily':
            // Last 24 hours
            start = subHours(now, 23);
            intervals = eachHourOfInterval({ start, end: now });
            dateFormat = "HH:00";
            break;
        case 'weekly':
            // Last 7 days
            start = subDays(now, 6);
            intervals = eachDayOfInterval({ start, end: now });
            dateFormat = "EEE"; // Mon, Tue...
            break;
        case 'monthly':
            // Last 30 days
            start = subDays(now, 29);
            intervals = eachDayOfInterval({ start, end: now });
            dateFormat = "dd MMM"; // 24 Apr
            break;
        case 'yearly':
            // Last 12 months
            start = subMonths(now, 11);
            intervals = eachMonthOfInterval({ start, end: now });
            dateFormat = "MMM yyyy"; // Apr 2026
            break;
        case 'all-time':
        default:
            // You can define a custom start or just go back 5 years
            start = subMonths(now, 59);
            intervals = eachMonthOfInterval({ start, end: now });
            dateFormat = "yyyy";
            break;
    }

    return intervals.map(date => ({
        label: format(date, dateFormat),
        timestamp: date,
        count: 0 // Default to 0
    }));
};

/**
 * Generic mapper to fill buckets with real data
 */
export const fillBuckets = (buckets: GraphBucket[], data: any[], dateField: string = 'createdAt', period: Period) => {
    const filled = [...buckets];

    data.forEach(item => {
        const itemDate = new Date(item[dateField]);

        const index = filled.findIndex(bucket => {
            if (period === 'daily') {
                return format(itemDate, "yyyy-MM-dd HH") === format(bucket.timestamp, "yyyy-MM-dd HH");
            }
            if (period === 'yearly') {
                return format(itemDate, "yyyy-MM") === format(bucket.timestamp, "yyyy-MM");
            }
            // weekly and monthly both use daily comparison
            return format(itemDate, "yyyy-MM-dd") === format(bucket.timestamp, "yyyy-MM-dd");
        });

        if (index !== -1) {
            filled[index].count += 1;
        }
    });

    return filled.map(({ label, count }) => ({ label, count }));
};