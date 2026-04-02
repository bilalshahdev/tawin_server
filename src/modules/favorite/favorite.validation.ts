import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
    body: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "errors.invalid_id"),
    }),
});