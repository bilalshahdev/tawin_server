// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { ApiError } from "../utils/apiError";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // Delete uploaded files if they exist
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
            message: err.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};