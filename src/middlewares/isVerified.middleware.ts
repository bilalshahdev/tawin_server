import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { STATUS_CODE, MESSAGE_KEYS } from "../config/constants";

export const isVerified = (req: Request, res: Response, next: NextFunction) => {

    if (!req.user?.isVerified) {
        throw new ApiError(
            STATUS_CODE.FORBIDDEN,
            MESSAGE_KEYS.AUTH.EMAIL_NOT_VERIFIED
        );
    }
    next();
};