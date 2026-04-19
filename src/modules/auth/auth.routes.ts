import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "./auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authRateLimiter } from "../../middlewares/rateLimiter.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and account management APIs
 */

/**
 * @swagger
 * /auth/test-login:
 *   get:
 *     summary: Internal test login for admin
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/test-login", authController.testLogin);

/**
 * @swagger
 * /auth/seed-admin:
 *   get:
 *     summary: Initialize the system admin
 *     description: Creates a protected admin user if one does not already exist.
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Admin created or already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/seed-admin", authController.seedAdmin);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/register", authRateLimiter, validate(schemas.registerSchema), authController.register);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify account via OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/verify-otp", authRateLimiter, validate(schemas.verifyOtpSchema), authController.verifyOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/login", authRateLimiter, validate(schemas.loginSchema), authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Reset instructions sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/forgot-password", validate(schemas.forgotPasswordSchema), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/reset-password", validate(schemas.resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtp'
 *     responses:
 *       200:
 *         description: New OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/resend-otp", authRateLimiter, validate(schemas.resendOtpSchema), authController.resendOtp);

/**
 * @swagger
 * /auth/change-email:
 *   post:
 *     summary: Change user email
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeEmail'
 *     responses:
 *       200:
 *         description: Email updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    "/change-email",
    authMiddleware,
    validate(schemas.changeEmailSchema),
    authController.changeEmail
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    "/change-password",
    authMiddleware,
    validate(schemas.changePasswordSchema),
    authController.changePassword
);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

/**
 * @swagger
 * /auth/delete-user/{userId}:
 *   delete:
 *     summary: Delete user account by admin
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/delete-user/:userId", authMiddleware, authController.deleteUserByAdmin);

export default router;