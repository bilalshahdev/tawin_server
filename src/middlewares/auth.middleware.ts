import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS, STATUS_CODE } from "../config/constants";
import { ApiError } from "../utils/apiError";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(
            new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.unauthorized"))
        );
    }

    try {
        const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET);
        (req as any).user = decoded;
        next();
    } catch {
        next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.invalid_token")));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
        }
        next();
    };
};