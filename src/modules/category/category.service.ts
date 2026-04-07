import { Category } from "./category.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { ICategory } from "./category.types";
import { Types } from "mongoose";

export const createCategory = async (data: Partial<ICategory>) => {
    const existing = await Category.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.category_exists");

    return await Category.create(data);
};

export const getAllCategories = async (query: any) => {
    const filter: any = {
        isActive: true,
        $or: [
            { parentCategory: { $exists: false } },
            { parentCategory: null }
        ]
    };
    if (query.type) filter.type = query.type;

    return await Category.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategory",
                as: "subcategories"
            }
        },
        {
            $sort: { "name.en": 1 }
        }
    ]);
};

/**
 * Fetches a single category by ID and includes its immediate subcategories
 */

export const getCategoryById = async (id: string) => {
    // 1. Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.invalid_id_format");
    }

    const category = await Category.aggregate([
        {
            $match: { _id: new Types.ObjectId(id) },
        },
        {
            $lookup: {
                from: "categories",
                localField: "parentCategory",
                foreignField: "_id",
                as: "parentCategory",
            },
        },
        {
            $unwind: {
                path: "$parentCategory",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategory",
                as: "subcategories",
            },
        },
    ]);

    if (!category || category.length === 0) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    }

    return category[0];
};

export const getCategoryBySlug = async (slug: string) => {
    const category = await Category.aggregate([
        {
            $match: { slug, isActive: true },
        },
        {
            $lookup: {
                from: "categories",
                localField: "parentCategory",
                foreignField: "_id",
                as: "parentCategory",
            },
        },
        {
            $unwind: {
                path: "$parentCategory",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategory",
                as: "subcategories",
            },
        },
    ]);

    if (!category || category.length === 0) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    }

    return category[0];
};

export const updateCategory = async (id: string, data: Partial<ICategory>) => {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return category;
};

export const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return category;
};