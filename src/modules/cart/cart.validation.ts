import { z } from "zod";

export const cartItemSchema = z.object({
    body: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
        quantity: z.number().int().min(1),
    })
});