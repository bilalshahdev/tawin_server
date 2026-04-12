import { Category } from "./category.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { ICategory } from "./category.types";
import { FilterQuery, Types } from "mongoose";
import { getPaginationOptions } from "../../utils/pagination";

export const createCategory = async (data: Partial<ICategory>) => {
    const existing = await Category.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.category_exists");

    return await Category.create(data);
};

export const getAllCategories = async (query: any) => {
    // Admin Flow: Flat list, Paginated, with Search
    if (query.admin === 'true') {
        const { page, limit, skip } = getPaginationOptions(query);
        const filter: FilterQuery<ICategory> = {};

        // Search filter for name in English or Arabic
        if (query.search) {
            filter.$or = [
                { "name.en": { $regex: query.search, $options: "i" } },
                { "name.ar": { $regex: query.search, $options: "i" } }
            ];
        }

        // Apply type filter if provided
        if (query.type) filter.type = query.type;

        const categories = await Category.find(filter)
            .populate("parentCategory", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Category.countDocuments(filter);

        return {
            categories,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
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

    return await Category.aggregate([
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
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return category;
};

export const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return category;
};