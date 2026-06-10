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

export type AuthConstants = typeof AUTH_CONSTANTS;
export type BasketStatus = 'pending' | 'approved' | 'rejected';
export type MailConstants = typeof MAIL_CONSTANTS;


export const PROPERTY_TYPES = ['Freehold', 'Leasehold'] as const;

export const UPLOAD_PATHS = {
    PROFILES: 'uploads/profiles',
    CATEGORIES: 'uploads/categories',
    PRODUCTS: 'uploads/products',
    BRANDS: 'uploads/brands',
    SETTINGS: 'uploads/settings',
    DOCUMENTS: 'uploads/documents',
    OTHERS: 'uploads/others',
} as const;

export enum STATUS_CODE {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
}