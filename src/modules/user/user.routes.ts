import { Router } from "express";
import * as userController from "./user.controller";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createUserSchema } from "./user.validation";

const router = Router();

router.post(
    "/",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "images", maxCount: 5 },
        { name: "resume", maxCount: 1 }
    ]),
    validate(createUserSchema),
    userController.createUser
);

export default router;