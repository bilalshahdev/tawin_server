import { Request, Response } from 'express';
import * as supplierService from './supplier.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';

export const create = asyncHandler(async (req: Request, res: Response) => {
    const data = await supplierService.createSupplier(req.body);
    return res.status(201).json(new ApiResponse(req.t('supplier.created'), data));
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await supplierService.getSuppliers(req.query);
    return res.status(200).json(new ApiResponse(req.t('supplier.fetched'), data, meta));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
    const data = await supplierService.getSupplierById(req.params.id as string);
    return res.status(200).json(new ApiResponse(req.t('supplier.fetched'), data));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const data = await supplierService.updateSupplier(req.params.id as string, req.body);
    return res.status(200).json(new ApiResponse(req.t('supplier.updated'), data));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await supplierService.deleteSupplier(req.params.id as string);
    return res.status(200).json(new ApiResponse(req.t('supplier.deleted')));
});

export const addStock = asyncHandler(async (req: Request, res: Response) => {
    const log = await supplierService.addStockInflow(req.body);
    return res.status(201).json(new ApiResponse(req.t('supplier.stock_added'), log));
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await supplierService.getDetailedHistory(req.params.id as string, req.query);
    return res.status(200).json(new ApiResponse(req.t('supplier.history_fetched'), data, meta));
});