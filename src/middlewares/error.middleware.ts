import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { STATUS_CODE } from "../config/constants";
import { logger } from "../config/logger";
import { config } from "../config/env.config";
import { deleteFile } from "../utils/deleteFile";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploadedFiles = (req as any).uploadedFiles as string[] | undefined;
    if (uploadedFiles) {
        uploadedFiles.forEach((filePath) => deleteFile(filePath));
    }

    logger.error(`${req.method} ${req.url} - ${err.message}`);
    if (config.env === 'development') {
        logger.debug(err.stack);
    }

    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    let message = err.message;
    let params: Record<string, unknown> | undefined;
    if (err instanceof ApiError) {
        params = err.params;
    } else if (config.env === 'production') {
        message = 'general.internal_error';
    }

    return res.status(statusCode).json({
        success: false,
        message: req.t(message, params as any),
        ...(config.env === 'development' && { stack: err.stack }),
    });
};