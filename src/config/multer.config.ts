import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';
import { UPLOAD_PATHS, STATUS_CODE } from './constants';
import { ApiError } from '../utils/apiError';

// Routes uploaded files to a per-domain folder under /uploads.
//
// Resolution order:
//   1. Document fields (resume / documents) — always go to /uploads/documents,
//      independent of the route they came in on.
//   2. URL-based routing — picks the folder by inspecting `req.baseUrl + req.path`,
//      so /api/products/* uploads land in /uploads/products, etc.
//   3. Fallback — anything we can't classify lands in /uploads/others.
const resolveDestination = (req: Request, file: Express.Multer.File): string => {
    if (file.fieldname === 'resume' || file.fieldname === 'documents') {
        return UPLOAD_PATHS.DOCUMENTS;
    }

    const url = `${req.baseUrl || ''}${req.path || ''}` || req.originalUrl || '';

    if (/\/(users|staff|auth|admin)(\/|$)/.test(url)) return UPLOAD_PATHS.PROFILES;
    if (/\/categories(\/|$)/.test(url)) return UPLOAD_PATHS.CATEGORIES;
    if (/\/products(\/|$)/.test(url)) return UPLOAD_PATHS.PRODUCTS;
    if (/\/brands(\/|$)/.test(url)) return UPLOAD_PATHS.BRANDS;
    if (/\/settings(\/|$)/.test(url)) return UPLOAD_PATHS.SETTINGS;

    return UPLOAD_PATHS.OTHERS;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = resolveDestination(req as Request, file);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.fieldname === 'resume' || file.fieldname === 'documents') {
        if (file.mimetype === 'application/pdf') return cb(null, true);
        return cb(new ApiError(STATUS_CODE.BAD_REQUEST, 'errors.only_pdf'));
    }

    if (allowedImageTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new ApiError(STATUS_CODE.BAD_REQUEST, 'errors.invalid_image'));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
