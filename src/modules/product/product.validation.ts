import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const localizedSchema = () =>
    z.object({
        en: z.string().min(1, "required"),
        ar: z.string().optional(),
    });

// Using z.unknown() for safer piping
const toNumber = z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
}, z.unknown());

const toBoolean = z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
}, z.unknown());

/**
 * Schemas
 */

export const createProductSchema = z.object({
    body: z.object({
        title: localizedSchema(),
        description: localizedSchema().optional(),
        category: z.string().regex(objectIdRegex, "invalid_id"),
        price: toNumber.pipe(z.number().positive()),
        originalPrice: toNumber.pipe(z.number().positive()).optional(),
        discount: toNumber.pipe(z.number().min(0)).optional(),
        variant: z.string().optional(),
        remainingPieces: toNumber.pipe(z.number().min(0)).optional(),
        isNewArrival: toBoolean.pipe(z.boolean()).optional(),
        isFeatured: toBoolean.pipe(z.boolean()).optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        title: localizedSchema().partial().optional(),
        description: localizedSchema().partial().optional(),
        category: z.string().regex(objectIdRegex).optional(),
        price: toNumber.pipe(z.number().positive()).optional(),
        originalPrice: toNumber.pipe(z.number().positive()).optional(),
        discount: toNumber.pipe(z.number().min(0)).optional(),
        variant: z.string().optional(),
        remainingPieces: toNumber.pipe(z.number().min(0)).optional(),
        isNewArrival: toBoolean.pipe(z.boolean()).optional(),
        isFeatured: toBoolean.pipe(z.boolean()).optional(),
    }).refine((data) => Object.keys(data).length > 0, { message: "empty_update" }),
});

export const updateStockSchema = z.object({
    body: z.object({
        quantity: toNumber.pipe(
            z.number()
                .int("invalid_format")
                .min(0, "non_negative")
        ),
        isAddition: toBoolean.pipe(z.boolean()).default(false),
    }),
});