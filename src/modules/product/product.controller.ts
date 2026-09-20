import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as productService from "./product.service";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE } from "../../config/constants";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const productData = {
        ...req.body,
        photo: files?.photo ? files.photo[0].path : undefined,
        images: files?.images ? files.images.map(file => file.path) : [],
    };

    const product = await productService.createProduct(productData);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("product.created"), product));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await productService.getAllProducts(req.query);
    res.json(new ApiResponse(req.t('product.list_retrieved'), data, meta));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
    const includeArchived = req.query.includeArchived === "true";
    const product = await productService.getProductById(req.params.id as string, includeArchived);
    res.json(new ApiResponse(req.t('product.fetched'), product));
});

export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await productService.getProductsByCategoryId(req.params.categoryId as string, req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('product.fetched'), data, meta));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const includeArchived = req.query.includeArchived === "true";
    const product = await productService.getProductBySlug(req.params.slug as string, includeArchived);
    res.json(new ApiResponse(req.t('product.fetched'), product));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && files.images) {
        data.images = files.images.map(file => file.path);
    }
    if (files && files.photo) {
        data.photo = files.photo[0].path;
    }
    const product = await productService.updateProduct(req.params.id as string, data);
    res.json(new ApiResponse(req.t('product.updated'), product));
});

export const importProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.importProducts(req.body.products);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('product.imported'), result));
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.archiveProduct(req.params.id as string);
    res.json(new ApiResponse(req.t('product.archived'), product));
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.restoreProduct(req.params.id as string);
    res.json(new ApiResponse(req.t('product.restored'), product));
});

export const getLowStock = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await productService.getLowStockProducts(req.query);
    res.json(new ApiResponse(req.t('product.low_stock_retrieved'), data, meta));
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateStock(req.params.id as string, req.body.quantity, req.body.isAddition);
    res.json(new ApiResponse(req.t('product.stock_updated'), product));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.archiveProduct(req.params.id as string);
    res.json(new ApiResponse(req.t('product.archived'), product));
});

export const exportProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.exportAllProducts();
    return res.status(200).json(new ApiResponse(req.t("product.exported"), products));
});

export const syncReviews = asyncHandler(async (req: Request, res: Response) => {
    const updatedCount = await productService.syncAllProductReviews();
    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("product.reviews_synced"), { updatedCount })
    );
});
