
import { z } from "zod";

export const adminVerifySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
    })
});

export const updateBasketRequestStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
    }),
    body: z.object({ // Move status here
        status: z.enum(['pending', 'approved', 'rejected'], {
            message: 'Status must be either pending, approved or rejected'
        })
    })
});