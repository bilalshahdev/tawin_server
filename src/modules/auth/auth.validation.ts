import { z } from "zod";
import { IRAQI_PHONE_PATTERN, normalizePhone } from "../../utils/normalizePhone";

const emptyStringToUndefined = (value: unknown) => (
    typeof value === "string" && value.trim() === "" ? undefined : value
);

const normalizeEmail = (value: unknown) => (
    typeof value === "string" && value.trim() !== "" ? value.trim().toLowerCase() : value
);

const optionalEmailSchema = z.preprocess(
    (value) => normalizeEmail(emptyStringToUndefined(value)),
    z.string().email({ message: "errors.validations.invalid_email" }).optional()
);

const optionalPhoneSchema = z.preprocess(
    (value) => normalizePhone(emptyStringToUndefined(value) as string | undefined),
    z.string()
        .regex(IRAQI_PHONE_PATTERN, { message: "errors.validations.auth.iraq_phone_format" })
        .optional()
);

const otpLangSchema = z.enum(['en', 'ar', 'ku']).optional();

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
        email: optionalEmailSchema,
        password: z.string().min(8, { message: "errors.validations.auth.password_too_weak" }),
        phone: optionalPhoneSchema,
        lang: otpLangSchema,
    }).refine((data) => data.email || data.phone, {
        message: "errors.validations.common.required",
        path: ["email"],
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: optionalEmailSchema,
        phone: optionalPhoneSchema,
        otp: z.string().length(6, { message: "errors.validations.auth.otp_length" }),
    }).refine((data) => data.email || data.phone, {
        message: "errors.validations.common.required",
        path: ["email"],
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: optionalEmailSchema,
        phone: optionalPhoneSchema,
        password: z.string().min(1, { message: "errors.validations.required" }),
    }).refine((data) => data.email || data.phone, {
        message: "errors.validations.common.required",
        path: ["email"],
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: optionalEmailSchema,
        phone: optionalPhoneSchema,
        lang: otpLangSchema,
    }).refine((data) => data.email || data.phone, {
        message: "errors.validations.common.required",
        path: ["email"],
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: optionalEmailSchema,
        phone: optionalPhoneSchema,
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
        email: optionalEmailSchema,
        phone: optionalPhoneSchema,
        lang: otpLangSchema,
    }).refine((data) => data.email || data.phone, {
        message: "errors.validations.common.required",
        path: ["email"],
    })
});

export const changeEmailSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "errors.validations.invalid_email" }),
    })
});
