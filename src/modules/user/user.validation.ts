import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    country: z.string().min(1),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
  })
});

export const adminVerifySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
  })
});