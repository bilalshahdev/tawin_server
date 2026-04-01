import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
        rating: z.number().min(1).max(5),
        comment: z.string().optional()
    })
});

export const getProductReviewsSchema = z.object({
    params: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/)
    })
});