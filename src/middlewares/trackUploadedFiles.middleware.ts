import { Request, Response, NextFunction } from "express";

/**
 * Normalizes all uploaded file paths (replacing \ with /)
 * and tracks them in req.uploadedFiles for automatic cleanup on error.
 */
export const trackUploadedFiles = (req: Request, res: Response, next: NextFunction) => {
    const uploadedFiles: string[] = [];

    // 1. Handle Single File (req.file)
    if (req.file) {
        req.file.path = req.file.path.replace(/\\/g, "/");
        uploadedFiles.push(req.file.path);
    }

    // 2. Handle Multiple Files (req.files)
    if (req.files) {
        if (Array.isArray(req.files)) {
            // Case: req.files is an array of files
            req.files.forEach((file: Express.Multer.File) => {
                file.path = file.path.replace(/\\/g, "/");
                uploadedFiles.push(file.path);
            });
        } else {
            // Case: req.files is an object with multiple fields
            Object.values(req.files).flat().forEach((file: Express.Multer.File) => {
                file.path = file.path.replace(/\\/g, "/");
                uploadedFiles.push(file.path);
            });
        }
    }

    // Attach the list of clean paths to the request for the global error handler
    (req as any).uploadedFiles = uploadedFiles;

    next();
};