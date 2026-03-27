import { StringValue } from 'ms';

export const AUTH_CONSTANTS = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'super-secret-key-123',
    JWT_ACCESS_EXPIRY: (process.env.JWT_ACCESS_EXPIRY || '1d') as StringValue,
    SALT_ROUNDS: process.env.SALT_ROUNDS
        ? parseInt(process.env.SALT_ROUNDS)
        : 10,
    ROLES: {
        ADMIN: 'admin',
        CUSTOMER: 'customer',
    },
    BASKET_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
    }
};

export const MAIL_CONSTANTS = {
    MAIL_MAILER: process.env.MAIL_MAILER || 'smtp',
    MAIL_HOST: process.env.MAIL_HOST || 'dcodax.com',
    MAIL_PORT: process.env.MAIL_PORT || 465,
    MAIL_USERNAME: process.env.MAIL_USERNAME || 'test@dcodax.com',
    MAIL_PASSWORD: process.env.MAIL_PASSWORD || 'dcodax@1234',
    MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION || 'ssl',
    MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || 'test@dcodax.com',
};

// define auth_constants type and export

export type AuthConstants = typeof AUTH_CONSTANTS;
export type BasketStatus = 'pending' | 'approved' | 'rejected';
export type MailConstants = typeof MAIL_CONSTANTS;


export const PROPERTY_TYPES = ['Freehold', 'Leasehold'] as const;

export const UPLOAD_PATHS = {
    PROFILE_PICS: 'uploads/profiles',
    DOCUMENTS: 'uploads/documents',
};

export enum STATUS_CODE {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export const MESSAGE_KEYS = {
    AUTH: {
        UNAUTHORIZED: "auth.unauthorized",
        INVALID_TOKEN: "auth.invalid_token",
        FORBIDDEN: "auth.forbidden",
        EMAIL_NOT_VERIFIED: "auth.email_not_verified",

        OTP_SENT: "auth.otp_sent",
        VERIFICATION_SUCCESS: "auth.verification_success",
        LOGIN_SUCCESS: "auth.login_success",
        RESET_TOKEN_SENT: "auth.reset_token_sent",
        PASSWORD_RESET_SUCCESS: "auth.password_reset_success",
        PASSWORD_CHANGED_SUCCESS: "auth.password_changed_success",
        OTP_RESEND_SUCCESS: "auth.otp_resend_success",
        EMAIL_CHANGED_SUCCESS: "auth.email_changed_success",
    },
    USER: {
        USERS_RETRIEVED: "user.users_retrieved",
        PROFILE_RETRIEVED: "user.profile_retrieved",
        PROFILE_UPDATED: "user.profile_updated",
        USER_VERIFIED: "user.user_verified",
        ACCOUNT_DELETED: "user.account_deleted",
        BASKET_APPLIED: "user.basket_applied",
        BASKET_REQUESTS_RETRIEVED: "user.basket_requests_retrieved",
        BASKET_REQUEST_STATUS_UPDATED: "user.basket_request_status_updated",
    },
    ERRORS: {
        USER_EXISTS: "errors.user_exists",
        USER_NOT_FOUND: "errors.user_not_found",
        INVALID_CREDENTIALS: "errors.invalid_credentials",
        VERIFY_EMAIL_FIRST: "errors.verify_email_first",
        ALREADY_VERIFIED: "errors.already_verified",
        OTP_INVALID: "errors.otp_invalid",
        OTP_EXPIRED: "errors.otp_expired",
        OTP_COOLDOWN: "errors.otp_cooldown",
        TOKEN_INVALID: "errors.token_invalid",
        OLD_PASSWORD_INCORRECT: "errors.old_password_incorrect",
    },

    VALIDATION: {
        FAILED: "validation.failed",
    },

    GENERAL: {
        INTERNAL_ERROR: "general.internal_error",
    },
} as const;