import { z } from 'zod';
import { CategoryType } from './category.types';

const localizedStringSchema = z.object({
    en: z.string().min(1, { message: "validation.failed" }),
    ar: z.string().optional(),
});

export const createCategorySchema = z.object({
    body: z.object({
        name: localizedStringSchema,
        description: localizedStringSchema.optional(),
        type: z.nativeEnum(CategoryType),
        parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        isActive: z.boolean().optional(),
    }).refine((data) => {
        if (data.type === CategoryType.SUB_CATEGORY && !data.parentCategory) {
            return false;
        }
        return true;
    }, {
        message: "errors.parent_category_required",
        path: ["parentCategory"],
    }),
});

export const updateCategorySchema = z.object({
    body: z.object({
        name: localizedStringSchema.optional(),
        description: localizedStringSchema.optional(),
        type: z.nativeEnum(CategoryType).optional(),
        parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        isActive: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
});