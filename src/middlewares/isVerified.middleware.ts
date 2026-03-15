import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const isVerified = (req: Request, res: Response, next: NextFunction) => {
    // req.user comes from your authMiddleware
    if (!req.user?.isVerified) {
        throw new ApiError(403, "Please verify your email to perform this action");
    }
    next();
};