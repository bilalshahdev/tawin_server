import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOAD_PATHS } from './constants';
import ApiError from '../utils/ApiError';
import { HttpCode } from './constants';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const root = file.fieldname === 'profileImage' ? UPLOAD_PATHS.PROFILE_PICS : UPLOAD_PATHS.DOCUMENTS;
        if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
        cb(null, root);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(HttpCode.BAD_REQUEST, 'Only images are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});