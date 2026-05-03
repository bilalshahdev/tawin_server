import { Request, Response } from 'express';
import * as orderService from './order.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import { STATUS_CODE } from '../../config/constants';

export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await orderService.getOrderStats();

    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("order.stats_retrieved"), stats)
    );
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.placeOrder(req.user!.id, req.body);
    return res.status(201).json(new ApiResponse(req.t('order_placed'), order));
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
    // If user is not admin, only fetch their own orders
    const userId = req.user!.role === 'admin' || req.user!.role === 'staff' ? undefined : req.user!.id;
    const { data, meta } = await orderService.getOrders(req.query, userId);
    return res.status(200).json(new ApiResponse(req.t('orders_fetched'), data, meta));
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.role === 'admin' || req.user!.role === 'staff' ? undefined : req.user!.id;
    const order = await orderService.getOrderDetails(req.params.id as string, userId);
    if (!order) throw new ApiError(404, "Order not found");
    return res.status(200).json(new ApiResponse(req.t('order_fetched'), order));
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateStatus(req.params.id as string, req.body.status);
    return res.status(200).json(new ApiResponse(req.t('order_updated'), order));
});

export const removeOrder = asyncHandler(async (req: Request, res: Response) => {
    await orderService.deleteOrder(req.params.id as string);
    return res.status(200).json(new ApiResponse(req.t('order_deleted')));
});