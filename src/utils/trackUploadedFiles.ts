import { Request, Response, NextFunction } from "express";

export const trackUploadedFiles = (req: Request, res: Response, next: NextFunction) => {

    const files = req.files as any;

    const paths: string[] = [];

    if (files) {

        Object.values(files).forEach((arr: any) => {
            arr.forEach((file: any) => {
                paths.push(file.path);
            });
        });

    }

    req.uploadedFiles = paths;

    next();
};