import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError';
import { STATUS_CODE } from '../config/constants';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'errors.too_many_requests',
    handler: (req, res, next) => {
        // Standardize the error using your ApiError utility
        next(new ApiError(STATUS_CODE.TOO_MANY_REQUESTS, 'errors.too_many_requests'));
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// A more generous limit for general API usage
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: 'errors.too_many_requests',
});