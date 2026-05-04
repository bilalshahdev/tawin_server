import { z } from 'zod';

// `user` is bound from req.user.id in the controller, never from body.
export const createReviewSchema = z.object({
    body: z.object({
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, "errors.validations.common.invalid_id"),
        rating: z.number().min(1).max(5),
        comment: z.string().optional()
    }).strict()
});

export const getProductReviewsSchema = z.object({
    params: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/)
    })
});