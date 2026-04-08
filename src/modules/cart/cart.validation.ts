import { z } from "zod";

export const cartItemSchema = z.object({
    body: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        quantity: z.number().min(1),
        attributes: z.record(z.string(), z.string()).optional().default({})
    })
});