import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "errors.validations.common.invalid_id");

// `user` always comes from req.user.id, never from body.
export const cartItemSchema = z.object({
    body: z.object({
        productId: objectId,
        quantity: z.number().int().min(1),
    }).strict()
});

export const removeCartItemSchema = z.object({
    body: z.object({
        productId: objectId,
    }).strict()
});