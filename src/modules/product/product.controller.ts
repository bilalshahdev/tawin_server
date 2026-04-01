import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as productService from "./product.service";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE } from "../../config/constants";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    const product = await productService.createProduct(data);
    res.status(201).json(new ApiResponse(req.t('product.product_created'), product));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getAllProducts(req.query);
    res.json(new ApiResponse(req.t('product.products_retrieved'), result.products, result.meta));
});

export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getProductsByCategoryId(req.params.categoryId as string, req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('product.fetched'), result.products, result.meta));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id as string);
    res.json(new ApiResponse(req.t('product.fetched'), product));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductBySlug(req.params.slug as string);
    res.json(new ApiResponse(req.t('product.fetched'), product));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    res.json(new ApiResponse(req.t('product.product_updated'), product));
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id as string, { stock: req.body.quantity });
    res.json(new ApiResponse(req.t('product.stock_updated'), product));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    res.json(new ApiResponse(req.t('product.product_deleted')));
});


// sync product reviews
export const syncReviews = asyncHandler(async (req: Request, res: Response) => {
    const updatedCount = await productService.syncAllProductReviews();
    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("product.reviews_synced"), { updatedCount })
    );
});