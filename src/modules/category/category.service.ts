import { Category } from "./category.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { ICategory } from "./category.types";
import { FilterQuery, Types } from "mongoose";
import { getPaginationOptions } from "../../utils/pagination";
import { PaginatedResponse } from "../../types/response.interface";
import { deleteFile } from "../../utils/deleteFile";

export const createCategory = async (data: Partial<ICategory>) => {
    const existing = await Category.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.category_exists");

    return await Category.create(data);
};

export const getAllCategories = async (query: any): Promise<PaginatedResponse<ICategory>> => {
    // Admin Flow: Flat list, Paginated, with Search
    if (query.admin === 'true') {
        const { page, limit, skip } = getPaginationOptions(query);
        const filter: FilterQuery<typeof Category> = {};

        if (query.search) {
            filter.$or = [
                { "name.en": { $regex: query.search, $options: "i" } },
                { "name.ar": { $regex: query.search, $options: "i" } }
            ];
        }

        if (query.type) filter.type = query.type;

        const [categories = [], totalDocs] = await Promise.all([
            Category.find(filter)
                .populate("parentCategory", "name slug")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Category.countDocuments(filter)
        ]);

        return {
            data: categories,
            meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) }
        };
    }

    // Default Flow: Consumer Tree Structure
    const filter: any = {
        $or: [
            { parentCategory: { $exists: false } },
            { parentCategory: null }
        ]
    };
    if (query.type) filter.type = query.type;

    const categories = await Category.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategory",
                as: "subcategories"
            }
        },
        { $sort: { "name.en": 1 } }
    ]);

    return {
        data: categories,
        meta: null
    };
};

export const getCategoryById = async (id: string, isAdmin: boolean = false) => {
    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.invalid_id_format");
    }

    // Simple find for Admin, Aggregated for Consumer
    if (isAdmin) {
        const category = await Category.findById(id).populate("parentCategory");
        if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
        return category;
    }

    const categories = await Category.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategory",
                as: "subcategories",
            },
        },
    ]);

    if (!categories.length) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return categories[0];
};

export const getCategoryBySlug = async (slug: string, isAdmin: boolean = false) => {
    if (isAdmin) {
        const category = await Category.findOne({ slug }).populate("parentCategory");
        if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
        return category;
    }

    const categories = await Category.aggregate([
        { $match: { slug } },
        {
            $lookup: {
                from: "categories", localField: "_id", foreignField: "parentCategory", as: "subcategories",
            },
        },
    ]);

    if (!categories.length) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return categories[0];
};

export const updateCategory = async (id: string, data: Partial<ICategory>) => {
    const existing = await Category.findById(id);
    if (!existing) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");

    if (data.thumbnail && existing.thumbnail && data.thumbnail !== existing.thumbnail) {
        deleteFile(existing.thumbnail);
    }

    return await Category.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");

    if (category.thumbnail) deleteFile(category.thumbnail);

    return category;
};