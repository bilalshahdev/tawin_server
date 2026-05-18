import {
    startOfDay, startOfMonth, startOfWeek, startOfYear,
    subDays, subMonths, subWeeks, subYears,
    endOfDay, endOfMonth, endOfWeek, endOfYear,
    subHours
} from 'date-fns';
import { Period } from '../../types/global.types';

export const getDateRange = (period: Period) => {
    const now = new Date();
    let currentStart: Date, prevStart: Date, prevEnd: Date;
    const currentEnd = now;

    switch (period) {
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

export const getRollingDateRange = (period: Period) => {
    const now = new Date();

    let currentStart: Date;
    let currentEnd: Date = now;
    let prevStart: Date | null = null;
    let prevEnd: Date | null = null;

    switch (period) {
        case 'daily': {
            // Last 24 hours
            currentStart = subHours(now, 24);
            prevStart = subHours(currentStart, 24);
            prevEnd = currentStart;
            break;
        }

        case 'weekly': {
            // Last 7 days
            currentStart = subDays(now, 7);
            prevStart = subDays(currentStart, 7);
            prevEnd = currentStart;
            break;
        }

        case 'monthly': {
            // Last 30 days
            currentStart = subDays(now, 30);
            prevStart = subDays(currentStart, 30);
            prevEnd = currentStart;
            break;
        }

        case 'yearly': {
            // Last 12 months
            currentStart = subMonths(now, 12);
            prevStart = subMonths(currentStart, 12);
            prevEnd = currentStart;
            break;
        }

        case 'all-time':
        default: {
            currentStart = new Date(0);
            prevStart = null;
            prevEnd = null;
            break;
        }
    }

    return {
        currentStart,
        currentEnd,
        prevStart,
        prevEnd,
    };
};