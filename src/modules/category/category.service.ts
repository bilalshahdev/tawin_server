import { Category } from "./category.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { ICategory } from "./category.types";

export const createCategory = async (data: Partial<ICategory>) => {
    const existing = await Category.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.category_exists");

    return await Category.create(data);
};

export const getAllCategories = async (query: any) => {
    const filter: any = { isActive: true };
    if (query.type) filter.type = query.type;
    if (query.parentCategory) filter.parentCategory = query.parentCategory;

    return await Category.find(filter)
        .populate('parentCategory', 'name slug')
        .sort({ createdAt: -1 });
};

export const getCategoryBySlug = async (slug: string) => {
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.category_not_found");
    return category;
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