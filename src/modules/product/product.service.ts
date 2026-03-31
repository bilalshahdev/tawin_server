import { Product } from "./product.model";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { STATUS_CODE } from "../../config/constants";

export const createProduct = async (data: any) => {
    return await Product.create(data);
};

export const getAllProducts = async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
            { "title.en": regex },
            { "title.ar": regex },
            { "category.en": regex }
        ];
    }

    if (query.category) filter["category.en"] = query.category;

    const [products, totalDocs] = await Promise.all([
        Product.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 }),
        Product.countDocuments(filter)
    ]);

    return { products, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getProductById = async (id: string) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const getProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug });
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");
    return product;
};

export const updateProduct = async (id: string, updateData: any) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    if (updateData.image && product.image) {
        await deleteFile(product.image);
    }

    return await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

export const deleteProduct = async (id: string) => {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.product_not_found");

    await deleteFile(product.image);
    return await Product.findByIdAndDelete(id);
};