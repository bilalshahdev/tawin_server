import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import * as addressService from "./address.service";
import { STATUS_CODE } from "../../config/constants";

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.addAddress(req.user!.id, req.body);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse(req.t("address.created"), address));
});

export const getMyAddresses = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.getMyAddresses(req.user!.id);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("address.retrieved"), addresses));
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.updateAddress(req.params.id as string, req.user!.id, req.body);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("address.updated"), address));
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    await addressService.deleteAddress(req.params.id as string, req.user!.id);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("address.deleted")));
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.setDefaultAddress(req.params.id as string, req.user!.id);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("address.default_set"), address));
});