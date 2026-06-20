import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as categoryService from "./category.service";
import { STATUS_CODE } from "../../config/constants";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await categoryService.getAllCategories(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.list_retrieved"), data, meta));
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.query.admin === 'true';
    const category = await categoryService.getCategoryBySlug(req.params.slug as string, isAdmin);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.retrieved"), category));
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.query.admin === 'true';
    const category = await categoryService.getCategoryById(req.params.id as string, isAdmin);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.retrieved"), category));
});


export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { parentCategory = "" } = req.body || {}
    const data = {
        ...req.body,
        parentCategory: (parentCategory === "" || parentCategory === "null")
            ? undefined
            : parentCategory,
        thumbnail: req.files && (req.files as any).thumbnail ? (req.files as any).thumbnail[0].path : undefined,
    };
    const category = await categoryService.createCategory(data);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("category.created"), category));
});


export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const updateData: any = { ...req.body };

    // Handle uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.thumbnail) updateData.thumbnail = files.thumbnail[0].path;

    const category = await categoryService.updateCategory(req.params.id as string, updateData);

    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("category.updated"), category)
    );
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.deleteCategory(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.deleted"), category));
});
