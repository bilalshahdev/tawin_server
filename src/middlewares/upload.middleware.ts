import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        let folder = "uploads/others";

        if (file.fieldname === "avatar") {
            folder = "uploads/avatars";
        }

        if (file.fieldname === "images") {
            folder = "uploads/images";
        }

        if (file.fieldname === "resume") {
            folder = "uploads/resumes";
        }

        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },

    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, unique + path.extname(file.originalname));
    }

});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});