import { Router } from "express";
import * as userController from "./user.controller";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import * as schemas from "./user.validation";

const router = Router();
router.post("/register", validate(schemas.registerSchema), userController.register);

router.patch(
    "/profile",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    validate(schemas.updateProfileSchema),
    userController.updateProfile
);

router.patch(
    "/profile-picture",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    userController.updateProfilePicOnly
);

router.patch(
    "/verify/:id",
    authMiddleware,
    authorize("admin"),
    validate(schemas.adminVerifySchema),
    userController.adminVerifyUser
);

router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    userController.getAllUsers
);

router.get(
    "/:id",
    authMiddleware,
    userController.getUser
);

export default router;