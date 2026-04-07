import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as categoryService from "./category.service";
import { STATUS_CODE } from "../../config/constants";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.categories_retrieved"), categories));
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.category_retrieved"), category));
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    console.log({id: req.params.id })
    const category = await categoryService.getCategoryById(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.category_retrieved"), category));
});


export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const data = {
        ...req.body,
        thumbnail: req.files && (req.files as any).thumbnail ? (req.files as any).thumbnail[0].path : undefined,
        icon: req.files && (req.files as any).icon ? (req.files as any).icon[0].path : undefined,
    };
    const category = await categoryService.createCategory(data);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("category.category_created"), category));
});


export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const updateData: any = { ...req.body };

    // Map flattened names/descriptions back to objects
    if (req.body['name[en]'] || req.body['name[ar]']) {
        updateData.name = {
            en: req.body['name[en]'],
            ar: req.body['name[ar]']
        };
    }

    // Handle uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.thumbnail) updateData.thumbnail = files.thumbnail[0].path;
    if (files?.icon) updateData.icon = files.icon[0].path;

    const category = await categoryService.updateCategory(req.params.id as string, updateData);
    
    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("category.category_updated"), category)
    );
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.deleteCategory(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("category.category_deleted"), category));
});
