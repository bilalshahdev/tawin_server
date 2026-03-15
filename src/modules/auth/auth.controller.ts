import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { ApiResponse } from "../../utils/apiResponse";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(new ApiResponse(req.t('auth.otp_sent'), result));
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