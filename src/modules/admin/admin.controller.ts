import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AUTH_CONSTANTS, STATUS_CODE } from "../../config/constants";
import bcrypt from "bcryptjs";
import * as adminService from "./admin.service";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || 'daily';
    const data = await adminService.getStats(filter);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.stats_retrieved"), data));
});

export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || 'daily';
    const data = await adminService.getSalesReport(filter);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.report_retrieved"), data));
});

export const getSalesByRegion = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getSalesByRegion();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.region_retrieved"), data));
});

export const getTopCategories = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getTopCategories();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.categories_retrieved"), data));
});

export const getFinancials = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await adminService.getFinancials(req.query as any);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.financials_retrieved"), data, meta));
});

export const getFinancialStats = asyncHandler(async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || 'monthly';
    const data = await adminService.getFinancialStats(filter);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.financial_stats_retrieved"), data));
});

export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getTopProducts();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.products_retrieved"), data));
});

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || 'daily';
    const data = await adminService.getFullSummary(filter);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.summary_retrieved"), data));
});

export const updateAdminProfile = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, username, email, phone, password } = req.body;

    let hashedPassword: string | undefined;
    if (password && typeof password === 'string' && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
    }

    const updateData: any = { firstName, lastName, email, username, phone };

    if (hashedPassword) {
        updateData.password = hashedPassword;
    }

    const adminId = req.user?.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.profilePicture?.[0]) {
        updateData.profileImage = files.profilePicture[0].path;
    }

    Object.keys(updateData).forEach(key => (updateData[key] === undefined) && delete updateData[key]);

    const data = await adminService.updateAdminProfile(adminId as string, updateData);

    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.profile_updated"), data));
});