import { z } from "zod";

// Helper for reusable Enums
const OperationEnum = z.enum(['get', 'post', 'patch', 'put', 'delete']);
const ModuleEnum = z.enum([
    'dashboard', 'orders', 'users', 'categories', 'brands', 'staff', 'products', 'sales',
    'construction-basket', 'reviews', 'suppliers',
    'coupon', 'financial', 'stock'
]);

const permissionSchema = z.object({
    module: ModuleEnum,
    operations: z.array(OperationEnum).min(1, { message: "At least one operation required" })
});

// `role` is locked to 'staff' at the model layer and must never be settable from
// the client. `.strict()` rejects role/_id/isVerified/etc. with a 400.
export const createStaffSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "errors.validations.common.required" }),
        lastName: z.string().min(1, { message: "errors.validations.common.required" }),
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
        password: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
        phone: z.string().optional(),
        permissions: z.array(permissionSchema).optional()
    }).strict()
});

export const updateStaffPermissionsSchema = z.object({
    body: z.object({
        isActive: z.boolean().optional(),
        permissions: z.array(permissionSchema).optional(),
        // Allows updating basic info too
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email({ message: "errors.validations.common.invalid_email" }).optional(),
        phone: z.string().optional()
    }).strict()
});