import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS, STATUS_CODE } from "../config/constants";
import { ApiError } from "../utils/apiError";

interface TokenPayload {
    id: string;
    role: string;
    isVerified: boolean;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.unauthorized")));
    }

    try {
        const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET) as TokenPayload;
        req.user = decoded;
        console.log({decoded})
        next();
    } catch {
        next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.invalid_token")));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
        }
        next();
    };
};