import { Request, Response } from 'express';
import * as couponService from './coupon.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';

export const getAdminCoupons = asyncHandler(async (req: Request, res: Response) => {
    // Passes page, limit, and search from req.query
    const result = await couponService.getAllCoupons(req.query);
    return res.status(200).json(new ApiResponse("Coupons fetched successfully", result));
});

export const adminCreateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);
    return res.status(201).json(new ApiResponse(req.t('coupon_created'), coupon));
});

export const userCheckCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code, amount } = req.body;
    const userId = req.user?.id;
    const result = await couponService.validateCoupon(code, amount, userId!);
    return res.status(200).json(new ApiResponse(req.t('coupon_applied'), result));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await couponService.getCouponStats();
    return res.status(200).json(new ApiResponse("Stats fetched", stats));
});