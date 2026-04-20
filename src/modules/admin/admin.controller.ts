import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE } from "../../config/constants";
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

export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getTopProducts();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.products_retrieved"), data));
});

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || 'daily';
    const data = await adminService.getFullSummary(filter);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("admin.summary_retrieved"), data));
});