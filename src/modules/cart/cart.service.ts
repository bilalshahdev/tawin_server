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
            .populate({ path: 'user', select: 'name email phone' })
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

    let isModified = false;
    const validItems = cart.items.filter(item => {
        const product = item.product as any;

        if (!product || product.isArchived) {
            isModified = true;
            return false;
        }

        const stock = product.remainingPieces || 0;
        if (item.quantity > stock) {
            item.quantity = stock;
            isModified = true;
        }

        return item.quantity > 0;
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
    const product = await Product.findOne({ _id: productId, isArchived: { $ne: true } });
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_available");

    const stock = product.remainingPieces || 0;
    if (stock <= 0) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.out_of_stock");

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        const newTotal = cart.items[itemIndex].quantity + quantity;
        if (newTotal > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        cart.items[itemIndex].quantity = newTotal;
    } else {
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
        Product.findOne({ _id: productId, isArchived: { $ne: true } })
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

export const generateQuotation = async (userId: string) => {
    const cart: any = await getMyCart(userId);
    const items = (cart?.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => {
            const product = item.product;
            const unitPrice = product.price || 0;
            const subtotal = unitPrice * item.quantity;
            return {
                product: product._id,
                productTag: product.productTag,
                title: product.title,
                quantity: item.quantity,
                unitPrice,
                subtotal,
            };
        });

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + 1000 * 60 * 60 * 24 * 7);
    const quotationNumber = "QT-" + generatedAt.getFullYear() + String(generatedAt.getMonth() + 1).padStart(2, "0") + String(generatedAt.getDate()).padStart(2, "0") + "-" + String(Date.now()).slice(-6);

    return {
        quotationNumber,
        generatedAt,
        expiresAt,
        items,
        totalAmount,
        currencyNote: "Final delivery charges or discounts may be applied during checkout.",
    };
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
