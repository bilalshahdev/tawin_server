import { z } from "zod";

const localizedSchema = (key: string) => z.object({
    en: z.string().min(1, `${key} in English is required`),
    ar: z.string().optional()
});

const localizedUpdateSchema = z.object({
    en: z.string().optional(),
    ar: z.string().optional()
}).optional();

export const createProductSchema = z.object({
    body: z.object({
        title: localizedSchema("Title"),
        category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID"),
        price: z.preprocess((val) => Number(val), z.number().positive()),
        description: localizedSchema("Description").optional(),
        remainingPieces: z.preprocess((val) => Number(val), z.number().int().nonnegative()).optional(),
        isNewArrival: z.preprocess((val) => val === 'true', z.boolean()).optional(),

        colors: z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Color")).optional(),
        sizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'])).optional(),
        weights: z.array(z.object({
            unit: z.enum(['g', 'kg', 'ml', 'l']),
            value: z.string()
        })).optional(),
    })
});

export const updateProductSchema = z.object({
    body: z.object({
        title: localizedUpdateSchema,
        category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        price: z.preprocess((val) => Number(val), z.number().positive().optional()),
        description: localizedUpdateSchema,
        remainingPieces: z.preprocess((val) => Number(val), z.number().int().nonnegative().optional()),
        isNewArrival: z.preprocess((val) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return val;
        }, z.boolean().optional()),

        colors: z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)).optional(),
        sizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'])).optional(),
        weights: z.array(z.object({
            unit: z.enum(['g', 'kg', 'ml', 'l']),
            value: z.string()
        })).optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});

export const updateStockSchema = z.object({
    body: z.object({
        quantity: z.preprocess(
            (val) => Number(val),
            z.number().int().nonnegative("Quantity cannot be negative")
        ),
        isAddition: z.preprocess(
            (val) => {
                if (typeof val === 'boolean') return val;
                if (val === 'true') return true;
                if (val === 'false') return false;
                return val;
            },
            z.boolean().optional()
        )
    })
});