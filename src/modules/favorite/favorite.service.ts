import { Favorite } from './favorite.model';
import { Product } from '../product/product.model';
import { ApiError } from '../../utils/apiError';
import { STATUS_CODE } from '../../config/constants';
import { getPaginationOptions } from '../../utils/pagination';

export const toggleFavorite = async (userId: string, productId: string) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    }

    const existing = await Favorite.findOne({ user: userId, product: productId });

    if (existing) {
        await Favorite.findByIdAndDelete(existing._id);
        return false; // Removed
    } else {
        await Favorite.create({ user: userId, product: productId });
        return true; // Added
    }
};

export const getMyFavorites = async (userId: string, query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const [favorites, totalDocs] = await Promise.all([
        Favorite.find({ user: userId })
            .populate('product')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Favorite.countDocuments({ user: userId })
    ]);
    return { data: favorites, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const clearProductFromAllWishlists = async (productId: string) => {
    await Favorite.deleteMany({ product: productId });
};