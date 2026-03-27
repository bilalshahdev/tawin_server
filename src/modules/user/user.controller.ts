import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";
import { ApiResponse } from "../../utils/apiResponse";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query?.search as string
    const page = parseInt(req.query?.page as string) || 1
    const limit = parseInt(req.query?.limit as string) || 10
    const users = await userService.getAllUsersService(page, limit, search);
    res.json(new ApiResponse(req.t('user.users_retrieved'), users));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUser(req.user!.id);
    res.json(new ApiResponse(req.t('user.profile_retrieved'), user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const updateData = { ...req.body };
    const files = req.files as any;


    if (files?.profileImage) {
        updateData.profileImage = files.profileImage[0].path;
    }

    const updatedUser = await userService.updateUser(req.user!.id, updateData);
    res.json(new ApiResponse(req.t('user.profile_updated'), updatedUser));
});

// verifyUser controller

export const verifyUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    if (!userId) {
        throw new Error('User ID is required');
    }
    const user = await userService.verifyUser(userId);
    res.json(new ApiResponse(req.t('user.user_verified'), user));
});


export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(req.user!.id);
    res.json(new ApiResponse(req.t('user.account_deleted')));
});

// applyForBasket controller
export const applyForBasket = asyncHandler(async (req: Request, res: Response) => {
    const basketData = req.body;
    const user = await userService.applyForBasket(req.user!.id, basketData);
    res.json(new ApiResponse(req.t('user.basket_applied'), user));
});

export const fetchAllBasketRequests = asyncHandler(async (req: Request, res: Response) => {
    const basketRequests = await userService.fetchAllBasketRequests();
    res.json(new ApiResponse(req.t('user.basket_requests_retrieved'), basketRequests));
});

export const updateBasketRequestStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const status = req.params.status as string;
    const basketRequest = await userService.updateBasketRequestStatus(userId, status);
    res.json(new ApiResponse(req.t('user.basket_request_status_updated'), basketRequest));
});


