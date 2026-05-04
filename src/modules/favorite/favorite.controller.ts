import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as favoriteService from './favorite.service';
import { STATUS_CODE } from '../../config/constants';
import { ApiResponse } from '../../utils/apiResponse';

export const toggle = asyncHandler(async (req: Request, res: Response) => {
    const isAdded = await favoriteService.toggleFavorite(req.user!.id, req.body.productId);

    const message = isAdded
        ? req.t("favorite.added")
        : req.t("favorite.removed");

    res.status(STATUS_CODE.OK).json(new ApiResponse(message, { isAdded }));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await favoriteService.getMyFavorites(req.user!.id, req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("favorite.list_retrieved"), data, meta));
});