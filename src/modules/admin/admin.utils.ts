import {
    startOfDay, startOfMonth, startOfWeek, startOfYear,
    subDays, subMonths, subWeeks, subYears,
    endOfDay, endOfMonth, endOfWeek, endOfYear
} from 'date-fns';

export const getDateRange = (filter: string) => {
    const now = new Date();
    let currentStart: Date, prevStart: Date, prevEnd: Date;
    const currentEnd = now;

    switch (filter) {
        case 'daily':
            currentStart = startOfDay(now);
            prevStart = startOfDay(subDays(now, 1));
            prevEnd = endOfDay(subDays(now, 1));
            break;
        case 'weekly':
            currentStart = startOfWeek(now, { weekStartsOn: 1 });
            prevStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
            prevEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
            break;
        case 'monthly':
            currentStart = startOfMonth(now);
            prevStart = startOfMonth(subMonths(now, 1));
            prevEnd = endOfMonth(subMonths(now, 1));
            break;
        case 'yearly':
            currentStart = startOfYear(now);
            prevStart = startOfYear(subYears(now, 1));
            prevEnd = endOfYear(subYears(now, 1));
            break;
        default: // all-time
            currentStart = new Date(0);
            prevStart = new Date(0);
            prevEnd = new Date(0);
    }

    return { currentStart, currentEnd, prevStart, prevEnd };
};

export const formatChange = (current: number, previous: number) => {
    if (previous === 0) {
        return { type: current >= 0 ? 'increase' : 'decrease', percentage: current > 0 ? 100 : 0 };
    }
    const diff = ((current - previous) / previous) * 100;
    return {
        type: diff >= 0 ? 'increase' : 'decrease',
        percentage: Math.abs(parseFloat(diff.toFixed(2)))
    };
};

export const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
};