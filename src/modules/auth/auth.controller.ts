import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { ApiResponse } from "../../utils/apiResponse";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(new ApiResponse("OTP sent to email", result));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.verifyOTP(req.body.email, req.body.otp);
    res.json(new ApiResponse("Verification successful", user));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(new ApiResponse("Login successful", result));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.json(new ApiResponse("Reset token sent to email"));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json(new ApiResponse("Password reset successfully"));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(userId, oldPassword, newPassword);

    res.json(new ApiResponse("Password changed successfully"));
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.resendOTP(email);
    res.json(new ApiResponse("A new OTP has been sent to your email."));
});