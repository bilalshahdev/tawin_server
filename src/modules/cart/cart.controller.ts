import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { ApiResponse } from "../../utils/apiResponse";
import { cartItemSchema } from "./cart.validation";
import { STATUS_CODE } from "../../config/constants";

// get all carts
export const getAllCarts = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await cartService.getAllCarts(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.carts_retrieved"), data, meta));
});

export const getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.getMyCart(req.user!.id);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.retrieved"), cart));
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!.id, productId, quantity);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.item_added"), cart));
});

export const updateQuantity = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.updateQuantity(req.user!.id, productId, quantity);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.quantity_updated"), cart));
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body;
    const cart = await cartService.removeFromCart(req.user!.id, productId);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.item_removed"), cart));
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clearCart(req.user!.id);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t("cart.cleared"), cart));
});
