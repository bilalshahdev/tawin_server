import { Product } from "./product.model";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { STATUS_CODE } from "../../config/constants";
import { Review } from "../review/review.model";
import { getPaginationOptions } from "../../utils/pagination";
import { config } from "../../config/env.config";


export const createProduct = async (data: any) => {
    return await Product.create(data);
};

export const getAllProducts = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);

    const filter: any = {};
    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
            { "title.en": regex },
            { "title.ar": regex },
        ];
    }

    if (query.category) filter.category = query.category;

    if (query.isNewArrival !== undefined) filter.isNewArrival = query.isNewArrival === 'true';
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.reduced !== undefined) filter.reduced = query.reduced === 'true';

    // 4. Stock Filter
    if (query.outOfStock !== undefined) {
        filter.remainingPieces = query.outOfStock === 'true' ? { $lte: 0 } : { $gt: 0 };
    }

    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

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

export const getProductById = async (id: string) => {
    const product = await Product.findById(id).populate('category');
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const getProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug }).populate('category');
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const getProductsByCategoryId = async (categoryId: string, query: any) => {
    return await getAllProducts({ ...query, category: categoryId });
};

export const updateProduct = async (id: string, updateData: any) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    // If a new photo is provided, delete the old one from storage
    if (updateData.photo && product.photo) {
        deleteFile(product.photo);
    }

    return await Product.findByIdAndUpdate(id, updateData, { new: true });
};


export const getLowStockProducts = async () => {
    return await Product.find({
        remainingPieces: { $lte: config.lowStockThreshold }
    }).sort({ remainingPieces: 1 });
};

// Update only the remainingPieces field for a specific product
export const updateProductStock = async (productId: string, quantity: number) => {
    return await Product.findByIdAndUpdate(
        productId,
        { remainingPieces: quantity },
        { new: true, runValidators: true }
    );
};



export const updateStock = async (id: string, quantity: number, isAddition: boolean = false) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    if (isAddition) {
        product.remainingPieces = (product.remainingPieces ?? 0) + quantity;
    } else {
        product.remainingPieces = quantity;
    }

    return await product.save();
};



export const deleteProduct = async (id: string) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    // Cleanup all files when product is deleted
    if (product.photo) deleteFile(product.photo);
    if (product.images) product.images.forEach(img => deleteFile(img));

    return await product.deleteOne();
};

/**
 * Export all products (Admin Only)
 * Fetches everything without pagination for CSV/JSON export
 */
export const exportAllProducts = async () => {
    return await Product.find()
        .populate({ path: 'category', select: 'name' })
        .sort({ createdAt: -1 })
        .lean();
};

// sync product reviews
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

