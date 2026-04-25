import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE, AUTH_CONSTANTS } from "../../config/constants";
import { User } from "../user/user.model";
import { config } from "../../config/env.config";
import { ApiError } from "../../utils/apiError";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === 'admin';
    const result = await authService.register(req.body, isAdmin);
    const message = isAdmin ? req.t('auth.user_registered') : req.t('auth.otp_sent');
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(message, result));
});

/**
 * @desc    Verify OTP for account activation
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body.email, req.body.otp);
    res.json(new ApiResponse(req.t('auth.verification_success'), result));
});

/**
 * @desc    Login user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(new ApiResponse(req.t('auth.login_success'), result));
});

/**
 * @desc    Staff Login
 * @route   POST /api/auth/staff/login
 * @access  Public
 */
export const staffLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.validations.common.required");
    }

    const { user, token } = await authService.staffLogin({ email, password });

    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("auth.login_success"), {
            user,
            token
        })
    );
});

/**
 * @desc    Request password reset token via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.json(new ApiResponse(req.t('auth.reset_token_sent')));
});

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json(new ApiResponse(req.t('auth.password_reset_success')));
});

/**
 * @desc    Change user email (requires verification)
 * @route   PATCH /api/auth/change-email
 * @access  Private
 */
export const changeEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.changeEmail(req.user!.id, req.body.email);
    res.json(new ApiResponse(req.t('auth.email_verification_sent'), user));
});

/**
 * @desc    Change user password while logged in
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
    res.json(new ApiResponse(req.t('auth.password_changed_success')));
});

/**
 * @desc    Resend verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendOtp(req.body.email);
    res.json(new ApiResponse(req.t('auth.otp_resend_success')));
});

/**
 * @desc    Seed initial Admin user (Dev/Internal use)
 * @route   POST /api/auth/seed-admin
 * @access  Internal
 */
export const seedAdmin = asyncHandler(async (req: Request, res: Response) => {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tawin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
        return res.status(STATUS_CODE.OK).json({
            success: true,
            message: req.t('errors.admin_already_exists'),
            data: { email: adminExists.email, role: adminExists.role }
        });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, AUTH_CONSTANTS.SALT_ROUNDS);
    const admin = await User.create({
        firstName: "System",
        lastName: "Admin",
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        country: "Pakistan"
    });

    res.status(STATUS_CODE.CREATED).json({
        success: true,
        message: req.t('auth.admin_created'),
        data: { email: admin.email, role: admin.role }
    });
});

/**
 * @desc    Test Login (Development only)
 * @route   POST /api/auth/test-login
 * @access  Dev-Only
 */
export const testLogin = asyncHandler(async (req: Request, res: Response) => {
    if (config.env !== 'development') {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "general.not_found");
    }

    const token = await authService.testLogin();
    res.json(new ApiResponse(req.t('auth.login_success'), token));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const { id, role } = req.user || {}

    if (role === 'admin') {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.admin_cannot_be_deleted");
    }

    await authService.deleteUser(id as string);
    res.json(new ApiResponse(req.t('auth.account_deleted')));
});

export const deleteUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { id, role } = req.user || {}

    if (role !== 'admin') {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.forbidden");
    }

    const { userId } = req.params;
    if (userId === id) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.admin_cannot_be_deleted");
    }
    await authService.deleteUser(userId as string);
    res.json(new ApiResponse(req.t('auth.account_deleted')));
});