import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        country: z.string().min(1),
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp: z.string().length(6),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string(),
        newPassword: z.string().min(8),
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(8),
    })
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    })
});