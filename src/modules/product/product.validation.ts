import { z } from "zod";

const localizedSchema = (key: string) => z.object({
    en: z.string().min(1, `${key} in English is required`),
    ar: z.string().optional()
});

export const createProductSchema = z.object({
    body: z.object({
        title: localizedSchema("Title"),
        category: localizedSchema("Category"),
        price: z.preprocess((val) => Number(val), z.number().positive()),
        description: localizedSchema("Description").optional(),
        remainingPieces: z.preprocess((val) => Number(val), z.number().int().nonnegative()).optional(),
        isNewArrival: z.preprocess((val) => val === 'true', z.boolean()).optional()
    })
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