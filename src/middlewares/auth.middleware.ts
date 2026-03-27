import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS, STATUS_CODE, MESSAGE_KEYS } from "../config/constants";
import { ApiError } from "../utils/apiError";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(
            new ApiError(STATUS_CODE.UNAUTHORIZED, MESSAGE_KEYS.AUTH.UNAUTHORIZED)
        );
    }

    try {
        const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET);
        (req as any).user = decoded;
        next();
    } catch {
        next(new ApiError(STATUS_CODE.UNAUTHORIZED, MESSAGE_KEYS.AUTH.INVALID_TOKEN));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            return next(new ApiError(STATUS_CODE.FORBIDDEN, MESSAGE_KEYS.AUTH.FORBIDDEN));
        }
        next();
    };
};