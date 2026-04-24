import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { Period } from "../../types/global.types";


export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as Period) || 'monthly';
    const stats = await userService.getUserStats(period);

    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("user.stats_retrieved"), stats)
    );
});

/**
 * @desc    Get all users with pagination
 * @route   GET /api/users
 * @access  Private/Admin
 */

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {

    const { data, meta } = await userService.getAllUsersService(req.query);
    res.json(new ApiResponse(req.t('user.users_retrieved'), data, meta));
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUser(req.user!.id);
    res.json(new ApiResponse(req.t('user.profile_retrieved'), user));
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { firstName,
        lastName,
        username,
        email,
        phone } = req.body
    const updateData: any = { firstName, lastName, username, email, phone };
    const files = req.files as any;


    if (files?.profileImage) {
        updateData.profileImage = files.profileImage[0].path;
    }

    const updatedUser = await userService.updateUser(req.user!.id, updateData);
    res.json(new ApiResponse(req.t('user.profile_updated'), updatedUser));
});

export const updateProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as any;

    if (!files?.profileImage) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.image_required");
    }

    const imagePath = files.profileImage[0].path;


    const updatedUser = await userService.updateProfilePicture(req.user!.id, imagePath);

    res.json(new ApiResponse(req.t('user.profile_picture_updated'), updatedUser));
});


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

export const applyForBasket = asyncHandler(async (req: Request, res: Response) => {
    const basketData = req.body;
    const user = await userService.applyForBasket(req.user!.id, basketData);
    res.json(new ApiResponse(req.t('user.basket_applied'), user));
});

export const fetchAllBasketRequests = asyncHandler(async (req: Request, res: Response) => {
    const basketRequests = await userService.fetchAllBasketRequests(req.query);
    res.json(new ApiResponse(req.t('user.basket_requests_retrieved'), basketRequests));
});

export const updateBasketRequestStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const status = req.body.status as string;

    const basketRequest = await userService.updateBasketRequestStatus(userId, status);
    res.json(new ApiResponse(req.t('user.basket_request_status_updated'), basketRequest));
});

export const deleteConstructionBasket = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const basketRequest = await userService.deleteConstructionBasket(userId);
    res.json(new ApiResponse(req.t('user.basket_request_deleted'), basketRequest));
});
