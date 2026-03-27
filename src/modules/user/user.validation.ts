import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
  })
});

export const applyForBasketSchema = z.object({
  body: z.object({
    fullRegistrationName: z.string().min(1, "Full registration name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    monthlyIncome: z.number().optional(),
    occupation: z.string().min(1, "Occupation is required"),
    unifiedCard: z.string().min(1, "Unified card is required"),
    residenceCard: z.string().min(1, "Residence card is required"),
    propertyArea: z.string().min(1, "Property area is required"),
    propertyType: z.enum(['Freehold', 'Leasehold'], {
      message: 'Property type must be either Freehold or Leasehold'
    }),
    country: z.string().optional(),
  })
});

