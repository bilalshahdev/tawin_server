import { z } from 'zod';

export const createCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3).max(20),
        type: z.enum(['percentage', 'fixed']),
        value: z.number().positive(),
        minOrderAmount: z.number().nonnegative().default(0),
        expiryDate: z.string().datetime(),
        usageLimit: z.number().int().positive(),
        isActive: z.boolean().optional(),
    }),
});

export const updateCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3).max(20).optional(),
        type: z.enum(['percentage', 'fixed']).optional(),
        value: z.number().positive().optional(),
        minOrderAmount: z.number().nonnegative().default(0).optional(),
        expiryDate: z.string().datetime().optional(),
        usageLimit: z.number().int().positive().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const validateCouponSchema = z.object({
    body: z.object({
        code: z.string().min(1),
        amount: z.number().positive(),
    }),
});