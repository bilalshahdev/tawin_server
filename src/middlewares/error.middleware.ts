import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { statusCode, message } = err;

    // 1. If it's not a custom ApiError, default to 500
    if (!(err instanceof ApiError)) {
        statusCode = 500;
        message = "Internal Server Error";
    }

    // 2. CRITICAL FIX: Translate the message using req.t
    // If the message contains a dot (like 'errors.user_exists'), it's a key
    const translatedMessage = req.t ? req.t(message) : message;

    res.status(statusCode).json({
        success: false,
        message: translatedMessage, // Now it will be "User already exists..."
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};