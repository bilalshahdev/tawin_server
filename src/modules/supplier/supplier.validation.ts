import { z } from "zod";

export const createSupplierSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Supplier name is required"),
        code: z.string().min(1, "Supplier code is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address").optional(),
        address: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const addStockSchema = z.object({
    body: z.object({
        supplier: z.string().min(1, "Supplier ID is required"),
        product: z.string().min(1, "Product ID is required"),
        supplierQuantity: z.number().positive("Supplier quantity is required"),
        supplierUnit: z.enum(['piece', 'ton']),
        costPrice: z.number().positive("Cost price is required"),
        sacksCount: z.number().optional(),
        note: z.string().optional(),
    }),
});

export const getStatsSchema = z.object({
    query: z.object({
        period: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'all-time']).optional(),
    }),
});