import { Request, Response } from 'express';
import * as couponService from './coupon.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';

export const getAdminCoupons = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await couponService.getAllCoupons(req.query);
    return res.status(200).json(new ApiResponse(req.t('coupon.list_retrieved'), data, meta));
});

export const adminCreateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);
    return res.status(201).json(new ApiResponse(req.t('coupon.created'), coupon));
});

export const userCheckCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const userId = req.user?.id;
    const items = await couponService.loadValidatableCart(userId!);
    const result = await couponService.validateCoupon(code, items, userId!);
    return res.status(200).json(new ApiResponse(req.t('coupon.applied'), result));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await couponService.getCouponStats();
    return res.status(200).json(new ApiResponse(req.t('coupon.stats_retrieved'), stats));
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
    if (!coupon) throw new ApiError(404, 'coupon.not_found');
    return res.status(200).json(new ApiResponse(req.t('coupon.updated'), coupon));
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.deleteCoupon(req.params.id as string);
    if (!coupon) throw new ApiError(404, 'coupon.not_found');
    return res.status(200).json(new ApiResponse(req.t('coupon.deleted')));
});

export const toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.toggleCouponStatus(req.params.id as string);
    if (!coupon) throw new ApiError(404, 'coupon.not_found');
    return res.status(200).json(new ApiResponse(req.t('coupon.status_toggled'), coupon));
});
