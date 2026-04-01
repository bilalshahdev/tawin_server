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

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "errors.invalid_id")
    }),
    body: z.object({
        "name[en]": z.string().min(2).optional(),
        "name[ar]": z.string().min(2).optional(),
        "description[en]": z.string().optional(),
        "description[ar]": z.string().optional(),
        parentCategory: z.preprocess(
            (val) => (val === "null" || val === "" ? null : val),
            z.string().regex(objectIdRegex, "errors.invalid_id").optional().nullable()
        ),
        isActive: z.preprocess(
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