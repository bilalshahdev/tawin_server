// src/config/multer.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOAD_PATHS, STATUS_CODE } from './constants';
import { ApiError } from '../utils/apiError';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder: string;
        switch (file.fieldname) {
            case 'avatar':
            case 'profileImage':
            case 'profile_pic':
                folder = UPLOAD_PATHS.PROFILE_PICS;
                break;
            case 'images':
            case 'productImage':
                folder = UPLOAD_PATHS.PRODUCTS;
                break;
            case 'resume':
                folder = UPLOAD_PATHS.RESUMES;
                break;
            case 'documents':
                folder = UPLOAD_PATHS.DOCUMENTS;
                break;
            default:
                folder = UPLOAD_PATHS.OTHERS;
        }

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.fieldname === 'resume' || file.fieldname === 'documents') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            // Pass the KEY, not the string
            cb(new ApiError(STATUS_CODE.BAD_REQUEST, 'errors.only_pdf'), false);
        }
    } else if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(STATUS_CODE.BAD_REQUEST, 'errors.invalid_image'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
