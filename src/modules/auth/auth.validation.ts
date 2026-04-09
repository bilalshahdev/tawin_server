import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "errors.validations.common.required" }),
        lastName: z.string().min(1, { message: "errors.validations.common.required" }),
        username: z.string().min(3, { message: "errors.validations.auth.username_short" }),
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
        password: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
        country: z.string().min(1, { message: "errors.validations.common.required" }),
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
        otp: z.string().length(6, { message: "errors.validations.auth.otp_length" }),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
        password: z.string().min(1, { message: "errors.validations.common.required" }),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.common.invalid_email" }),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, { message: "errors.validations.common.required" }),
        newPassword: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, { message: "errors.validations.common.required" }),
        newPassword: z.string().min(8, "errors.validations.auth.password_too_weak"),
    })
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email("errors.validations.common.invalid_email"),
    })
});

export const changeEmailSchema = resendOtpSchema;