import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const couponBodyShape = {
    code: z.string().min(3).max(20),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive(),
    minOrderAmount: z.number().nonnegative().default(0),
    expiryDate: z.string().datetime(),
    usageLimit: z.number().int().positive(),
    isActive: z.boolean().optional(),
    appliesTo: z.enum(['all', 'category', 'product']).default('all'),
    categories: z.array(objectId).default([]),
    products: z.array(objectId).default([]),
};

const scopeRefinement = (data: any, ctx: z.RefinementCtx) => {
    if (data.appliesTo === 'category' && (!data.categories || data.categories.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['categories'],
            message: 'categories must be a non-empty array when appliesTo is "category"',
        });
    }
    if (data.appliesTo === 'product' && (!data.products || data.products.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['products'],
            message: 'products must be a non-empty array when appliesTo is "product"',
        });
    }
};

// `usedCount` and `usedBy` are server-managed counters and must NEVER be accepted from
// client input — `.strict()` rejects them (along with `_id`, `createdAt`, etc.) with a 400.
export const createCouponSchema = z.object({
    body: z.object(couponBodyShape).strict().superRefine(scopeRefinement),
});

export const updateCouponSchema = z.object({
    body: z.object({
        code: couponBodyShape.code.optional(),
        type: couponBodyShape.type.optional(),
        value: couponBodyShape.value.optional(),
        minOrderAmount: z.number().nonnegative().optional(),
        expiryDate: couponBodyShape.expiryDate.optional(),
        usageLimit: couponBodyShape.usageLimit.optional(),
        isActive: z.boolean().optional(),
        appliesTo: couponBodyShape.appliesTo.optional(),
        categories: z.array(objectId).optional(),
        products: z.array(objectId).optional(),
    }).strict().superRefine((data, ctx) => {
        if (data.appliesTo) scopeRefinement(data, ctx);
    }),
});

export const validateCouponSchema = z.object({
    body: z.object({
        code: z.string().min(1),
    }).strict(),
});
