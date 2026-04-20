import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as brandService from "./brand.service";
import { STATUS_CODE } from "../../config/constants";

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
    if (req.file) req.body.image = req.file.path;
    const brand = await brandService.createBrand(req.body);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("brand.created"), brand));
});

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await brandService.getAllBrands(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("brand.retrieved"), data, meta));
});

export const getBrand = asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.getBrandById(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("brand.retrieved"), brand));
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
    if (req.file) req.body.image = req.file.path;
    const brand = await brandService.updateBrand(req.params.id as string, req.body);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("brand.updated"), brand));
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
    await brandService.deleteBrand(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("brand.deleted"), null));
});