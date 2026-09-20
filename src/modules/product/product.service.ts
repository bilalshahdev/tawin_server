import { Types } from "mongoose";
import { Product } from "./product.model";
import { Category } from "../category/category.model";
import { Cart } from "../cart/cart.model";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { STATUS_CODE } from "../../config/constants";
import { Review } from "../review/review.model";
import { getPaginationOptions } from "../../utils/pagination";
import { config } from "../../config/env.config";
import * as notificationService from '../notification/notification.service';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const toNumberValue = (value: any) => {
    if (value === undefined || value === null || value === "") return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
};

const toBooleanValue = (value: any) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    const normalized = String(value).trim().toLowerCase();
    if (["true", "yes", "1"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
    return undefined;
};

const toImageArray = (value: any) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return String(value).split(/[;,]/).map((item) => item.trim()).filter(Boolean);
};

const buildProductFilter = (query: any = {}) => {
    const filter: any = {};

    if (query.archived === 'true' || query.archived === true) {
        filter.isArchived = true;
    } else if (query.includeArchived !== 'true' && query.includeArchived !== true) {
        filter.isArchived = { $ne: true };
    }

    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
            { "title.en": regex },
            { "title.ar": regex },
            { productTag: regex },
        ];
    }

    if (query.category) filter.category = query.category;

    if (query.isNewArrival !== undefined) filter.isNewArrival = query.isNewArrival === 'true';
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.featuredProducts === 'true' || query.featuredProducts === true) filter.isFeatured = true;
    if (query.reduced === 'true') {
        filter.remainingPieces = { $lte: config.lowStockThreshold };
    }

    if (query.outOfStock !== undefined) {
        filter.remainingPieces = query.outOfStock === 'true' ? { $lte: 0 } : { $gt: 0 };
    }

    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    return filter;
};

const resolveCategoryId = async (row: any) => {
    const categoryValue = row.categoryId || row.category;
    if (!categoryValue) return undefined;

    const normalized = String(categoryValue).trim();
    if (objectIdRegex.test(normalized)) return normalized;

    const category = await Category.findOne({
        $or: [
            { "name.en": new RegExp("^" + normalized + "$", "i") },
            { "name.ar": normalized },
            { slug: normalized.toLowerCase() },
        ]
    }).select("_id");

    return category?._id?.toString();
};

const buildImportPayload = async (row: any, isCreate: boolean) => {
    const payload: any = {};

    if (row.productTag) payload.productTag = String(row.productTag).trim();

    const titleEn = row.titleEn || row.title?.en;
    const titleAr = row.titleAr || row.title?.ar;
    if (titleEn || titleAr) {
        payload.title = {};
        if (titleEn) payload.title.en = String(titleEn).trim();
        if (titleAr) payload.title.ar = String(titleAr).trim();
    }

    const descriptionEn = row.descriptionEn || row.description?.en;
    const descriptionAr = row.descriptionAr || row.description?.ar;
    if (descriptionEn || descriptionAr) {
        payload.description = {};
        if (descriptionEn) payload.description.en = String(descriptionEn).trim();
        if (descriptionAr) payload.description.ar = String(descriptionAr).trim();
    }

    const category = await resolveCategoryId(row);
    if (category) payload.category = category;

    const price = toNumberValue(row.price);
    if (price !== undefined) payload.price = price;

    const originalPrice = toNumberValue(row.originalPrice);
    if (originalPrice !== undefined) payload.originalPrice = originalPrice;

    const discount = toNumberValue(row.discount);
    if (discount !== undefined) payload.discount = discount;

    const remainingPieces = toNumberValue(row.remainingPieces);
    if (remainingPieces !== undefined) payload.remainingPieces = remainingPieces;

    if (row.variant) payload.variant = String(row.variant).trim();

    const isNewArrival = toBooleanValue(row.isNewArrival);
    if (isNewArrival !== undefined) payload.isNewArrival = isNewArrival;

    const isFeatured = toBooleanValue(row.isFeatured);
    if (isFeatured !== undefined) payload.isFeatured = isFeatured;

    if (row.photo) payload.photo = String(row.photo).trim();

    const images = toImageArray(row.images);
    if (images) payload.images = images;

    if (isCreate) {
        if (!payload.title?.en) throw new Error("titleEn is required for new products");
        if (!payload.category) throw new Error("category/categoryId is required for new products");
        if (payload.price === undefined || payload.price <= 0) throw new Error("valid price is required for new products");
        if (!payload.images) payload.images = [];
    }

    return payload;
};

export const createProduct = async (data: any) => {
    return await Product.create(data);
};

export const getAllProducts = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = buildProductFilter(query);

    const [products, totalDocs] = await Promise.all([
        Product.find(filter)
            .populate({ path: 'category', select: 'name' })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .lean(),
        Product.countDocuments(filter)
    ]);

    return { data: products, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getProductById = async (id: string, includeArchived = false) => {
    const filter: any = { _id: id };
    if (!includeArchived) filter.isArchived = { $ne: true };
    const product = await Product.findOne(filter).populate('category');
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const getProductBySlug = async (slug: string, includeArchived = false) => {
    const filter: any = { slug };
    if (!includeArchived) filter.isArchived = { $ne: true };
    const product = await Product.findOne(filter).populate('category');
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const getProductsByCategoryId = async (categoryId: string, query: any) => {
    return await getAllProducts({ ...query, category: categoryId });
};

export const updateProduct = async (id: string, updateData: any) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    if (updateData.photo && product.photo && updateData.photo !== product.photo) {
        deleteFile(product.photo);
    }

    if (updateData.images && Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach((oldImg: string) => deleteFile(oldImg));
    }

    if (updateData.isArchived === true && product.isArchived !== true) {
        updateData.archivedAt = new Date();
    }
    if (updateData.isArchived === false) {
        updateData.archivedAt = null;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (updatedProduct) {
        if (updateData.isNewArrival === true && product.isNewArrival !== true) {
            await notificationService.notifyAllCustomers({
                title: 'NOTIF_NEW_ARRIVAL_TITLE',
                message: 'NOTIF_NEW_ARRIVAL_MSG',
                type: 'promotion',
                metadata: { productId: updatedProduct._id }
            });
        }

        if (updateData.isFeatured === true && product.isFeatured !== true) {
            await notificationService.notifyAllCustomers({
                title: 'NOTIF_FEATURED_PRODUCT_TITLE',
                message: 'NOTIF_FEATURED_PRODUCT_MSG',
                type: 'promotion',
                metadata: { productId: updatedProduct._id }
            });
        }
    }

    return updatedProduct;
};

export const archiveProduct = async (id: string) => {
    const product = await updateProduct(id, { isArchived: true });
    await Cart.updateMany(
        { "items.product": new Types.ObjectId(id) },
        { $pull: { items: { product: new Types.ObjectId(id) } } }
    );
    return product;
};

export const restoreProduct = async (id: string) => {
    return await updateProduct(id, { isArchived: false });
};

export const importProducts = async (rows: any[]) => {
    const result = {
        total: rows.length,
        created: 0,
        updated: 0,
        failed: [] as Array<{ row: number; productTag?: string; error: string }>,
    };

    for (const [index, row] of rows.entries()) {
        try {
            const productId = row.productId || row._id;
            const productTag = row.productTag ? String(row.productTag).trim() : undefined;

            let existing = null;
            if (productId) existing = await Product.findById(productId);
            if (!existing && productTag) existing = await Product.findOne({ productTag });

            const payload = await buildImportPayload(row, !existing);

            if (existing) {
                await Product.findByIdAndUpdate(existing._id, payload, { runValidators: true });
                result.updated += 1;
            } else {
                await Product.create(payload);
                result.created += 1;
            }
        } catch (error: any) {
            result.failed.push({
                row: index + 1,
                productTag: row.productTag,
                error: error?.message || "Import failed",
            });
        }
    }

    return result;
};

export const getLowStockProducts = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = {
        remainingPieces: { $lte: config.lowStockThreshold },
        isArchived: { $ne: true },
    };
    const [products, totalDocs] = await Promise.all([
        Product.find(filter).sort({ remainingPieces: 1 }).limit(limit).skip(skip),
        Product.countDocuments(filter)
    ]);
    return { data: products, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const updateProductStock = async (productId: string, quantity: number) => {
    const product = await Product.findOneAndUpdate(
        { _id: productId, isArchived: { $ne: true } },
        { remainingPieces: quantity },
        { new: true, runValidators: true }
    );

    if (product) {
        if (product.remainingPieces === 0) {
            await notificationService.notifyAdmins({
                title: 'NOTIF_OUT_OF_STOCK_TITLE',
                message: 'NOTIF_OUT_OF_STOCK_MSG',
                type: 'stock',
                metadata: { productId: product._id }
            });
        } else if (product.remainingPieces <= config.lowStockThreshold) {
            await notificationService.notifyAdmins({
                title: 'NOTIF_LOW_STOCK_TITLE',
                message: 'NOTIF_LOW_STOCK_MSG',
                type: 'stock',
                metadata: { productId: product._id }
            });
        }
    }

    return product;
};

export const updateStock = async (id: string, quantity: number, isAddition: boolean = false) => {
    const product = await Product.findOne({ _id: id, isArchived: { $ne: true } });
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    if (isAddition) {
        product.remainingPieces = (product.remainingPieces ?? 0) + quantity;
    } else {
        product.remainingPieces = quantity;
    }

    const savedProduct = await product.save();

    if (savedProduct.remainingPieces === 0) {
        await notificationService.notifyAdmins({
            title: 'NOTIF_OUT_OF_STOCK_TITLE',
            message: 'NOTIF_OUT_OF_STOCK_MSG',
            type: 'stock',
            metadata: { productId: savedProduct._id }
        });
    } else if (savedProduct.remainingPieces <= config.lowStockThreshold) {
        await notificationService.notifyAdmins({
            title: 'NOTIF_LOW_STOCK_TITLE',
            message: 'NOTIF_LOW_STOCK_MSG',
            type: 'stock',
            metadata: { productId: savedProduct._id }
        });
    }

    return savedProduct;
};

export const deleteProduct = async (id: string) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    if (product.photo) deleteFile(product.photo);
    if (product.images) product.images.forEach(img => deleteFile(img));

    return await product.deleteOne();
};

export const exportAllProducts = async () => {
    return await Product.find()
        .populate({ path: 'category', select: 'name' })
        .sort({ createdAt: -1 })
        .lean();
};

export const syncAllProductReviews = async () => {
    const stats = await Review.aggregate([
        {
            $group: {
                _id: "$product",
                reviewCount: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    const updatePromises = stats.map((stat) => {
        return Product.findByIdAndUpdate(stat._id, {
            rating: Math.round(stat.avgRating * 10) / 10,
            reviewCount: stat.reviewCount
        });
    });

    const reviewedProductIds = stats.map(s => s._id);
    const resetPromise = Product.updateMany(
        { _id: { $nin: reviewedProductIds } },
        { rating: 0, reviewCount: 0 }
    );

    await Promise.all([...updatePromises, resetPromise]);

    return stats.length;
};
