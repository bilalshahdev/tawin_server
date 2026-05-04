import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { STATUS_CODE } from '../../config/constants';
import * as notificationService from './notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.getMyNotifications(req.user!.id, req.query);
    return res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t('notification.list_retrieved'), result)
    );
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id as string, req.user!.id);
    return res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t('notification.marked_read'), notification)
    );
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id);
    return res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t('notification.all_marked_read'), null)
    );
});