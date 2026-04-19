// src/modules/admin/admin.utils.ts (or inside the service)
import { startOfDay, endOfDay, subDays, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';

export const getDateRange = (filter: string) => {
    const now = new Date();
    let currentStart: Date, prevStart: Date, prevEnd: Date;

    if (filter === 'weekly') {
        currentStart = startOfWeek(now);
        prevStart = startOfWeek(subWeeks(now, 1));
        prevEnd = subDays(currentStart, 1);
    } else if (filter === 'monthly') {
        currentStart = startOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = subDays(currentStart, 1);
    } else { // daily
        currentStart = startOfDay(now);
        prevStart = startOfDay(subDays(now, 1));
        prevEnd = subDays(currentStart, 1);
    }

    return { currentStart, prevStart, prevEnd };
};

export const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
};