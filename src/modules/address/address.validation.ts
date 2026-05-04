import { z } from "zod";

// `user` is bound from req.user.id in the controller, never from body.
export const createAddressSchema = z.object({
    body: z.object({
        label: z.string().optional().default("Home"),
        street: z.string({
            message: "errors.validations.common.required"
        }).min(1, { message: "errors.validations.common.required" }),
        city: z.string({
            message: "errors.validations.common.required"
        }).min(1, { message: "errors.validations.common.required" }),
        state: z.string({
            message: "errors.validations.common.required"
        }).min(1, { message: "errors.validations.common.required" }),
        zipCode: z.string().optional().nullable(),
        country: z.string({
            message: "errors.validations.common.required"
        }).min(1, { message: "errors.validations.common.required" }),
        isDefault: z.boolean().optional().default(false),
    }).strict(),
});

export const updateAddressSchema = z.object({
    body: z.object({
        label: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional().nullable(),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
    }).strict().refine((data) => Object.keys(data).length > 0, {
        message: "errors.validations.common.empty_update",
    }),
});