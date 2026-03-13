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

// define auth_constants type and export

export type AuthConstants = typeof AUTH_CONSTANTS;
export type BasketStatus = 'pending' | 'approved' | 'rejected';


export const PROPERTY_TYPES = ['Freehold', 'Leasehold'] as const;

export const UPLOAD_PATHS = {
    PROFILE_PICS: 'uploads/profiles',
    DOCUMENTS: 'uploads/documents',
};

export enum HttpCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}