import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "errors.validations.common.invalid_id");

export const checkoutSchema = z.object({
    body: z.object({
        addressId: objectId,
        shippingType: z.enum(["free", "express"]).optional().default("free"),
        paymentMethod: z.enum(["COD"]).optional().default("COD"),
        couponCode: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
    }).strict(),
});

export const updateOrderStatusSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
    }).strict(),
});

export const orderIdParamSchema = z.object({
    params: z.object({ id: objectId }),
});
