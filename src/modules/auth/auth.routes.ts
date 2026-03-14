import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "./auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Public Routes
router.post("/register", validate(schemas.registerSchema), authController.register);
router.post("/verify-otp", validate(schemas.verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/login", validate(schemas.loginSchema), authController.login);
router.post("/forgot-password", validate(schemas.forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(schemas.resetPasswordSchema), authController.resetPassword);

// Protected Routes (Require Login)
router.post(
    "/change-password",
    authMiddleware,
    validate(schemas.changePasswordSchema),
    authController.changePassword
);

export default router;