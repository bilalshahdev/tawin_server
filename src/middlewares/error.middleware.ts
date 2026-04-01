// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { ApiError } from "../utils/apiError";
import { STATUS_CODE } from "../config/constants";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploadedFiles = (req as any).uploadedFiles as string[] | undefined;

    if (uploadedFiles) {
        uploadedFiles.forEach((filePath) => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: req.t(err.message),
        });
    }

    const genericMessage = err.message ? req.t(err.message) : req.t('general.internal_error');

    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: genericMessage,
    });
}