import { Types } from "mongoose";
import { Cart } from "./cart.model";
import { Product } from "../product/product.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { getPaginationOptions } from "../../utils/pagination";

/**
 * Get all carts (Admin only)
 */
export const getAllCarts = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const [carts, totalDocs] = await Promise.all([
        Cart.find()
            .populate({ path: 'user', select: 'name email' })
            .populate({ path: 'items.product' })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .lean(),
        Cart.countDocuments()
    ]);

    return {
        data: carts,
        meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) }
    };
};

/**
 * Get User's Cart and Sync with Stock
 */
export const getMyCart = async (userId: string) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) return { items: [], total: 0 };

    // SYNC: Remove deleted products and cap quantity to current stock
    let isModified = false;
    const validItems = cart.items.filter(item => {
        const product = item.product as any;

        // 1. If product no longer exists in DB, remove it from cart
        if (!product) {
            isModified = true;
            return false;
        }

        // 2. If cart quantity exceeds current stock, cap it at available stock
        const stock = product.remainingPieces || 0;
        if (item.quantity > stock) {
            item.quantity = stock;
            isModified = true;
        }

        return true;
    });

    if (isModified) {
        cart.items = validItems as any;
        await cart.save();
    }

    return cart;
};

/**
 * Add item to cart
 */
export const addToCart = async (userId: string, productId: string, quantity: number) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_available");

    // Check if item is in stock at all
    const stock = product.remainingPieces || 0;
    if (stock <= 0) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.out_of_stock");

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Update existing item
        const newTotal = cart.items[itemIndex].quantity + quantity;
        if (newTotal > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        cart.items[itemIndex].quantity = newTotal;
    } else {
        // Add new item
        if (quantity > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        cart.items.push({ product: new Types.ObjectId(productId), quantity });
    }

    return await cart.save();
};

/**
 * Update specific item quantity
 */
export const updateQuantity = async (userId: string, productId: string, quantity: number) => {
    const [cart, product] = await Promise.all([
        Cart.findOne({ user: userId }),
        Product.findById(productId)
    ]);

    if (!cart) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.cart_not_found");
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    const stock = product.remainingPieces || 0;
    if (quantity > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.item_not_in_cart");

    cart.items[itemIndex].quantity = quantity;
    return await cart.save();
};

/**
 * Remove single item from cart
 */
export const removeFromCart = async (userId: string, productId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId) as any;

    if (cart.items.length !== initialLength) {
        return await cart.save();
    }

    return cart;
};

/**
 * Empty the cart
 */
export const clearCart = async (userId: string) => {
    return await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] },
        { new: true }
    );
};