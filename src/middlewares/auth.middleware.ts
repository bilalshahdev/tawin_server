import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS } from "../config/constants";
import { ApiError } from "../utils/apiError";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }

    try {
        const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET);
        (req as any).user = decoded;
        next();
    } catch {
        next(new ApiError(401, "Invalid token"));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            return next(new ApiError(403, "Forbidden: You do not have permission"));
        }
        next();
    };
};