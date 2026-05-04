import { z } from 'zod';

const localizedSchema = (key: string) =>
    z.object({
        en: z.string().min(1, `${key} required`),
        ar: z.string().optional(),
    });

const toBoolean = z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
}, z.unknown());

// Schema for creating a Brand
export const createBrandSchema = z.object({
    body: z.object({
        name: localizedSchema("name"),
        description: localizedSchema("description").optional(),
        isActive: toBoolean.optional(),
    }).strict(),
});

// Schema for updating a Brand (all fields optional)
export const updateBrandSchema = z.object({
    body: z.object({
        name: localizedSchema("name").optional(),
        description: localizedSchema("description").optional(),
        isActive: toBoolean.optional(),
    }).strict(),
});