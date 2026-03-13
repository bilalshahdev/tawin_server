// src/middlewares/trackUploadedFiles.middleware.ts
import { Request, Response, NextFunction } from "express";

export const trackUploadedFiles = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const paths: string[] = [];

    if (files) {
        Object.values(files).forEach((arr) => {
            arr.forEach((file) => {
                paths.push(file.path);
            });
        });
    }

    // Attach paths to request object for global error handler
    (req as any).uploadedFiles = paths;

    next();
};