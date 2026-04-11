import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const units = ["g", "kg", "ml", "l"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/**
 * Reusable Helpers
 */

// Simplified to avoid overload conflicts. .min(1) handles both empty and missing strings.
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

const toArray = z.preprocess((val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
}, z.unknown());

const weightSchema = z.object({
    // Changed errorMap to message to match the z.enum overload
    unit: z.enum(units, { message: "invalid_enum" }),
    value: z.string().min(1, "required"),
});

/**
 * Schemas
 */
export const createProductSchema = z.object({
    body: z.object({
        title: localizedSchema(),
        description: localizedSchema().optional(),
        category: z.string().regex(objectIdRegex, "invalid_id"),

        price: toNumber.pipe(z.number().positive("positive")),
        originalPrice: toNumber.pipe(z.number().positive("positive")).optional(),
        discount: toNumber.pipe(z.number().min(0, "non_negative")).optional(),

        remainingPieces: toNumber.pipe(
            z.number().int("invalid_format").min(0, "non_negative")
        ).optional(),

        isNewArrival: toBoolean.pipe(z.boolean()).optional(),

        colors: toArray.pipe(
            z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "invalid_format"))
        ).optional(),

        sizes: toArray.pipe(
            z.array(z.enum(sizes, { message: "invalid_enum" }))
        ).optional(),

        weights: z.array(weightSchema).optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        title: localizedSchema().partial().optional(),
        description: localizedSchema().partial().optional(),
        category: z.string().regex(objectIdRegex, "invalid_id").optional(),

        price: toNumber.pipe(z.number().positive("positive")).optional(),
        originalPrice: toNumber.pipe(z.number().positive("positive")).optional(),
        discount: toNumber.pipe(z.number().min(0, "non_negative")).optional(),

        images: toArray.pipe(z.array(z.string())).optional(),

        remainingPieces: toNumber.pipe(
            z.number().int("invalid_format").min(0, "non_negative")
        ).optional(),

        isNewArrival: toBoolean.pipe(z.boolean()).optional(),

        colors: toArray.pipe(
            z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "invalid_format"))
        ).optional(),

        sizes: toArray.pipe(
            z.array(z.enum(sizes, { message: "invalid_enum" }))
        ).optional(),

        weights: z.array(weightSchema).optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: "empty_update",
    }),
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