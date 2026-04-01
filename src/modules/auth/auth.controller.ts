import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE } from "../../config/constants";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
import { AUTH_CONSTANTS } from "../../config/constants";



export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t('auth.otp_sent'), result));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.verifyOTP(req.body.email, req.body.otp);
    res.json(new ApiResponse(req.t('auth.verification_success'), user));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(new ApiResponse(req.t('auth.login_success'), result));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.json(new ApiResponse(req.t('auth.reset_token_sent')));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json(new ApiResponse(req.t('auth.password_reset_success')));
});

export const changeEmail = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { email } = req.body;
    await authService.changeEmail(userId, email);
    res.json(new ApiResponse(req.t('auth.password_changed_success')));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(userId, oldPassword, newPassword);
    res.json(new ApiResponse(req.t('auth.password_changed_success')));
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendOTP(req.body.email);
    res.json(new ApiResponse(req.t('auth.otp_resend_success')));
});


export const seedAdmin = asyncHandler(async (req: Request, res: Response) => {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tawin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    // Check if any admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
        return res.status(STATUS_CODE.OK).json({
            success: true,
            message: req.t('errors.admin_already_exists'),
            data: { email: adminExists.email, password: adminPassword, role: adminExists.role }
        });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
        firstName: "System",
        lastName: "Admin",
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        country: "Pakistan",
        constructionBasket: {
            isApplied: false,
            status: "approved"
        }
    });

    res.status(STATUS_CODE.CREATED).json({
        success: true,
        message: req.t('auth.admin_created'),
        data: { email: admin.email, password: adminPassword, role: admin.role }
    });
});

// dev mode only
export const testLogin = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(STATUS_CODE.NOT_FOUND).json(new ApiResponse(req.t('general.not_found'), null));
    }
    const result = await authService.testLogin();
    res.json(new ApiResponse(req.t('auth.login_success'), result));
});

export const seedUsers = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(STATUS_CODE.NOT_FOUND).json(new ApiResponse(req.t('general.not_found'), null));
    }
    const userCount = await User.countDocuments({ email: { $regex: /user\d+@example\.com/ } });
    if (userCount > 0) {
        return res.status(STATUS_CODE.BAD_REQUEST).json(
            new ApiResponse(req.t("errors.users_already_seeded"), null)
        );
    }

    const hashedPassword = await bcrypt.hash("12345678", AUTH_CONSTANTS.SALT_ROUNDS);

    const dummyUsers = [
        {
            firstName: "John",
            lastName: "Doe",
            username: "user1",
            email: "user1@example.com",
            password: hashedPassword,
            isVerified: true,
            country: "Pakistan",
            role: "customer"
        },
        {
            firstName: "Jane",
            lastName: "Smith",
            username: "user2",
            email: "user2@example.com",
            password: hashedPassword,
            isVerified: true,
            country: "Pakistan",
            role: "customer"
        },
        {
            firstName: "Ahmed",
            lastName: "Ali",
            username: "user3",
            email: "user3@example.com",
            password: hashedPassword,
            isVerified: true,
            country: "Pakistan",
            role: "customer"
        },
        {
            firstName: "Unverified",
            lastName: "User",
            username: "user4",
            email: "user4@example.com",
            password: hashedPassword,
            isVerified: false,
            country: "Pakistan",
            role: "customer",
            verificationOtp: "123456",
            verificationOtpExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    ];

    try {
        await User.insertMany(dummyUsers);
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json(
            new ApiResponse(req.t("errors.users_already_seeded"), null)
        );
    }

    res.status(STATUS_CODE.CREATED).json(
        new ApiResponse(req.t("messages.users_seeded"), dummyUsers.length)
    );
});