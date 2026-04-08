import { z } from "zod";

export const createAddressSchema = z.object({
    body: z.object({
        label: z.string().optional().default("Home"),
        street: z.string({ error: "Street is required" }),
        city: z.string({ error: "City is required" }),
        state: z.string({ error: "State is required" }),
        zipCode: z.string().optional().nullable(), // Made optional as requested
        country: z.string({ error: "Country is required" }),
        isDefault: z.boolean().optional().default(false),
    }),
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
    }).refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});