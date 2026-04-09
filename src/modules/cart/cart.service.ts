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
    if (!attr || Object.keys(attr).length === 0) return JSON.stringify({});

    const sortObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sortObject);
        return Object.keys(obj).sort().reduce((acc: any, key) => {
            acc[key] = sortObject(obj[key]);
            return acc;
        }, {});
    };

    return JSON.stringify(sortObject(attr));
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
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_available");

    const stock = product.remainingPieces || 0;
    if (stock <= 0) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.out_of_stock");

    // --- STRICT ATTRIBUTE VALIDATION ---
    if (attributes && Object.keys(attributes).length > 0) {
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'color') {
                if (!product.colors?.includes(value as string)) {
                    throw new ApiError(STATUS_CODE.BAD_REQUEST, `Invalid color: ${value}`);
                }
            } else if (key === 'size') {
                if (!product.sizes?.includes(value as string)) {
                    throw new ApiError(STATUS_CODE.BAD_REQUEST, `Invalid size: ${value}`);
                }
            } else if (key === 'weight') {
                const reqW = value as { unit: string; value: string };
                const isValid = product.weights?.some(w => w.unit === reqW.unit && w.value === reqW.value);
                if (!isValid) {
                    throw new ApiError(STATUS_CODE.BAD_REQUEST, `Invalid weight: ${reqW.value}${reqW.unit}`);
                }
            } else {
                throw new ApiError(STATUS_CODE.BAD_REQUEST, `Attribute '${key}' is not allowed`);
            }
        }
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const targetAttrString = getNormalizedAttributes(attributes);

    const itemIndex = cart.items.findIndex(item => {
        // Mongoose Map must be converted to an object for normalization
        const itemAttrObj = item.attributes instanceof Map ? Object.fromEntries(item.attributes) : item.attributes;
        return item.product.toString() === productId && getNormalizedAttributes(itemAttrObj) === targetAttrString;
    });

    if (itemIndex > -1) {
        const newTotal = cart.items[itemIndex].quantity + quantity;
        if (newTotal > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        cart.items[itemIndex].quantity = newTotal;
    } else {
        if (quantity > stock) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
        cart.items.push({ product: new Types.ObjectId(productId), quantity, attributes });
    }

    return await cart.save();
};

export const updateQuantity = async (userId: string, productId: string, quantity: number, attributes: any) => {
    // 1. Fetch cart and product in parallel for performance
    const [cart, product] = await Promise.all([
        Cart.findOne({ user: userId }),
        Product.findById(productId)
    ]);

    if (!cart) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.cart_not_found");
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    // 2. Strict Stock Check
    const stock = product.remainingPieces || 0;
    if (quantity > stock) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.insufficient_stock");
    }

    // 3. Normalize incoming attributes for comparison
    const targetAttrString = getNormalizedAttributes(attributes);

    // 4. Find the specific variant in the cart
    const itemIndex = cart.items.findIndex(item => {
        const itemAttrObj = item.attributes instanceof Map ? Object.fromEntries(item.attributes) : item.attributes;
        const itemAttrString = getNormalizedAttributes(itemAttrObj);
        return item.product.toString() === productId && itemAttrString === targetAttrString;
    });

    if (itemIndex === -1) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.item_not_in_cart");
    }

    // 5. Update and save
    cart.items[itemIndex].quantity = quantity;
    return await cart.save();
};

export const removeFromCart = async (userId: string, productId: string, attributes: any) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    // 1. Normalize incoming attributes
    const targetAttrString = getNormalizedAttributes(attributes);

    // 2. Filter out the specific variant
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => {
        const itemAttrObj = item.attributes instanceof Map ? Object.fromEntries(item.attributes) : item.attributes;
        const itemAttrString = getNormalizedAttributes(itemAttrObj);

        // Keep the item if it's NOT the one we want to remove
        const isTarget = item.product.toString() === productId && itemAttrString === targetAttrString;
        return !isTarget;
    }) as any;

    // 3. Only save if an item was actually removed
    if (cart.items.length !== initialLength) {
        return await cart.save();
    }

    return cart;
};

export const clearCart = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    cart.items = [] as any;
    return await cart.save();
};