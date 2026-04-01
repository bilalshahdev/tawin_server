import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "./auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();


router.get("/test-login", authController.testLogin);
router.get("/seed-users", authController.seedUsers);
router.post("/register", validate(schemas.registerSchema), authController.register);
router.post("/verify-otp", validate(schemas.verifyOtpSchema), authController.verifyOtp);
router.post("/login", validate(schemas.loginSchema), authController.login);
router.post("/forgot-password", validate(schemas.forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(schemas.resetPasswordSchema), authController.resetPassword);
router.post("/resend-otp", validate(schemas.resendOtpSchema), authController.resendOtp);

// Protected route
router.post("/change-email", authMiddleware, validate(schemas.changeEmailSchema), authController.changeEmail);
router.post("/change-password", authMiddleware, validate(schemas.changePasswordSchema), authController.changePassword);
export default router;