import { z } from "zod";

// Helper for reusable Enums
const OperationEnum = z.enum(['get', 'post', 'patch', 'put', 'delete']);
const ModuleEnum = z.enum([
    'dashboard', 'orders', 'users', 'staff', 'products', 'sales',
    'construction-basket', 'reviews', 'suppliers',
    'coupon', 'financial', 'brand', 'stock'
]);

const permissionSchema = z.object({
    module: ModuleEnum,
    operations: z.array(OperationEnum).min(1, { message: "At least one operation required" })
});

export const createStaffSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "errors.validations.common.required" }),
        lastName: z.string().min(1, { message: "errors.validations.common.required" }),
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
        phone: z.string().optional(),
        permissions: z.array(permissionSchema).optional()
    })
});

export const updateStaffPermissionsSchema = z.object({
    body: z.object({
        isActive: z.boolean().optional(),
        permissions: z.array(permissionSchema).optional(),
        // Allows updating basic info too
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional()
    })
});