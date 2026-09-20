import { Favorite } from './favorite.model';
import { Product } from '../product/product.model';
import { ApiError } from '../../utils/apiError';
import { STATUS_CODE } from '../../config/constants';
import { getPaginationOptions } from '../../utils/pagination';

export const toggleFavorite = async (userId: string, productId: string) => {
    const product = await Product.findOne({ _id: productId, isArchived: { $ne: true } });
    if (!product) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    }

    const existing = await Favorite.findOne({ user: userId, product: productId });

    if (existing) {
        await Favorite.findByIdAndDelete(existing._id);
        return false;
    } else {
        await Favorite.create({ user: userId, product: productId });
        return true;
    }
};

export const getMyFavorites = async (userId: string, query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const favorites = await Favorite.find({ user: userId })
        .populate({ path: 'product', match: { isArchived: { $ne: true } } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const data = favorites.filter((favorite: any) => favorite.product);
    return { data, meta: { page, limit, totalDocs: data.length, totalPages: Math.ceil(data.length / limit) } };
};

export const clearProductFromAllWishlists = async (productId: string) => {
    await Favorite.deleteMany({ product: productId });
};
