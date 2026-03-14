import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.registerUser(req.body);
    res.status(201).json(new ApiResponse("Registration successful", user));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware
    const files = req.files as any;

    const updateData = { ...req.body };
    if (files?.profileImage) {
        updateData.profileImage = files.profileImage[0].path;
    }

    const updatedUser = await userService.updateUserService(userId, updateData);
    res.json(new ApiResponse("Profile updated", updatedUser));
});

export const updateProfilePicOnly = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const files = req.files as any;

    if (!files?.profileImage) throw new ApiError(400, "No image uploaded");

    const updatedUser = await userService.updateUserService(userId, {
        profileImage: files.profileImage[0].path
    });

    res.json(new ApiResponse("Profile picture updated", updatedUser));
});

export const adminVerifyUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.verifyUserByAdmin(req.params.id as string);
    if (!user) throw new ApiError(404, "User not found");
    res.json(new ApiResponse("User verified by admin", user));
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsersService();
    res.json(new ApiResponse("Users retrieved", users));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserService(req.params.id as string);
    if (!user) throw new ApiError(404, "User not found");
    res.json(new ApiResponse("User retrieved", user));
});