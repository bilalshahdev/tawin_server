import { Types } from "mongoose";
import { Cart } from "./cart.model";
import { Product } from "../product/product.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { getPaginationOptions } from "../../utils/pagination";

/**
 * Helper to ensure attribute objects are compared consistently
 * by sorting keys before stringifying.
 */
const getNormalizedAttributes = (attr: any) => {
    if (!attr) return JSON.stringify({});
    const sortedObj = Object.keys(attr).sort().reduce((obj: any, key) => {
        obj[key] = attr[key];
        return obj;
    }, {});
    return JSON.stringify(sortedObj);
};

export const getAllCarts = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const [carts, totalDocs] = await Promise.all([
        Cart.find()
            .populate({ path: 'user' })
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

export const getMyCart = async (userId: string) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) return { items: [], total: 0 };

    // SYNC: Remove items where product was deleted and adjust quantity to current stock
    const validItems = cart.items.filter(item => {
        const product = item.product as any;
        return product !== null;
    });

    validItems.forEach(item => {
        const product = item.product as any;
        const stock = product.remainingPieces || 0;
        if (item.quantity > stock) {
            item.quantity = stock;
        }
    });

    if (validItems.length !== cart.items.length || cart.isModified()) {
        cart.items = validItems as any;
        await cart.save();
    }

    return cart;
};

export const addToCart = async (userId: string, productId: string, quantity: number, attributes: any) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_available");
    }

    const stock = product.remainingPieces || 0;
    if (stock <= 0) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.out_of_stock");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const targetAttrString = getNormalizedAttributes(attributes);

    const itemIndex = cart.items.findIndex(item => {
        const itemAttrString = getNormalizedAttributes(Object.fromEntries(item.attributes));
        return item.product.toString() === productId && itemAttrString === targetAttrString;
    });

    if (itemIndex > -1) {
        const newTotal = cart.items[itemIndex].quantity + quantity;
        if (newTotal > stock) {
            throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        }
        cart.items[itemIndex].quantity = newTotal;
    } else {
        if (quantity > stock) {
            throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        }
        cart.items.push({ product: new Types.ObjectId(productId), quantity, attributes });
    }

    return await cart.save();
};

export const updateQuantity = async (userId: string, productId: string, quantity: number, attributes: any) => {
    const [cart, product] = await Promise.all([
        Cart.findOne({ user: userId }),
        Product.findById(productId)
    ]);

    if (!cart) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.cart_not_found");
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    const stock = product.remainingPieces || 0;
    if (quantity > stock) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
    }

    const targetAttrString = getNormalizedAttributes(attributes);

    const itemIndex = cart.items.findIndex(item => {
        const itemAttrString = getNormalizedAttributes(Object.fromEntries(item.attributes));
        return item.product.toString() === productId && itemAttrString === targetAttrString;
    });

    if (itemIndex === -1) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.item_not_in_cart");
    }

    cart.items[itemIndex].quantity = quantity;
    return await cart.save();
};

export const removeFromCart = async (userId: string, productId: string, attributes: any) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    const targetAttrString = getNormalizedAttributes(attributes);

    cart.items = cart.items.filter(item => {
        const itemAttrString = getNormalizedAttributes(Object.fromEntries(item.attributes));
        return !(item.product.toString() === productId && itemAttrString === targetAttrString);
    }) as any;

    return await cart.save();
};

export const clearCart = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    cart.items = [] as any;
    return await cart.save();
};