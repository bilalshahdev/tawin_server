import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, { message: "errors.validations.common.required" }).optional(),
    lastName: z.string().min(1, { message: "errors.validations.common.required" }).optional(),
    username: z.string().min(3, { message: "errors.validations.auth.username_short" }).optional(),
    phone: z.string().min(1, { message: "errors.validations.common.required" }).optional(),
    country: z.string().min(1, { message: "errors.validations.common.required" }).optional(),
  })
});

export const applyForBasketSchema = z.object({
  body: z.object({
    fullRegistrationName: z.string().min(1, "errors.validations.common.required" ),
    phoneNumber: z.string().min(1, { message: "errors.validations.common.required" }),
    monthlyIncome: z.number({
      message: "errors.validations.common.positive"
    }).positive({ message: "errors.validations.common.positive" }).optional(),
    occupation: z.string().min(1, { message: "errors.validations.common.required" }),
    unifiedCard: z.string().min(1, { message: "errors.validations.common.required" }),
    residenceCard: z.string().min(1, { message: "errors.validations.common.required" }),
    propertyArea: z.string().min(1, { message: "errors.validations.common.required" }),
    propertyType: z.enum(['Freehold', 'Leasehold'], {
      message: "errors.validations.common.required"
    }),
    country: z.string().min(1, { message: "errors.validations.common.required" }).optional(),
  })
});