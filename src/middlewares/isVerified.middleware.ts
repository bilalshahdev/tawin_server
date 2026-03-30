import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { STATUS_CODE } from "../config/constants";

export const isVerified = (req: Request, res: Response, next: NextFunction) => {

    if (!req.user?.isVerified) {
        throw new ApiError(
            STATUS_CODE.FORBIDDEN,
            req.t("auth.email_not_verified")
        );
    }
    next();
};