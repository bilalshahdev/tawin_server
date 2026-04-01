import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as categoryService from "./category.service";
import { STATUS_CODE } from "../../config/constants";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const data = {
        ...req.body,
        thumbnail: req.files && (req.files as any).thumbnail ? (req.files as any).thumbnail[0].path : undefined,
        icon: req.files && (req.files as any).icon ? (req.files as any).icon[0].path : undefined,
    };
    const category = await categoryService.createCategory(data);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("category.category_created"), category));
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.categories_retrieved"), categories));
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.category_retrieved"), category));
});