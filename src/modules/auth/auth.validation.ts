import { z } from "zod";

/**
 * Reusable Helpers (Matching Product Pattern)
 */
const toNumber = z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
}, z.unknown());

/**
 * Schemas
 */
export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "errors.validations.required" }),
        lastName: z.string().min(1, { message: "errors.validations.required" }),
        username: z.string().min(3, { message: "errors.validations.auth.username_short" }),
        email: z.string().email({ message: "errors.validations.invalid_email" }),
        password: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
        phone: z.string().min(1, { message: "errors.validations.required" }),
        country: z.string().min(1, { message: "errors.validations.required" }),
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.invalid_email" }),
        otp: z.string().length(6, { message: "errors.validations.auth.otp_length" }),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.invalid_email" }),
        password: z.string().min(1, { message: "errors.validations.required" }),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.invalid_email" }),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, { message: "errors.validations.required" }),
        newPassword: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, { message: "errors.validations.required" }),
        newPassword: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
    })
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.invalid_email" }),
    })
});

export const changeEmailSchema = resendOtpSchema;