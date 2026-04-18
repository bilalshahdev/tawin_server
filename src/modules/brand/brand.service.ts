import { Brand } from "./brand.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { IBrand } from "./brand.types";
import { getPaginationOptions } from "../../utils/pagination";

export const createBrand = async (data: Partial<IBrand>) => {
    const existing = await Brand.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.brand_exists");
    return await Brand.create(data);
};

export const getAllBrands = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { filter, search } = query || { filter: {}, search: '' };
    if (search) {
        filter.$or = [
            { "name.en": { $regex: search, $options: 'i' } },
            { "name.ar": { $regex: search, $options: 'i' } }
        ];
    }
    const [brands, totalDocs] = await Promise.all([
        Brand.find(filter)
            .skip(skip)
            .limit(limit),
        Brand.countDocuments(filter)
    ]);
    return { data: brands, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getBrandById = async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");
    return brand;
};

export const updateBrand = async (id: string, data: Partial<IBrand>) => {
    const brand = await Brand.findByIdAndUpdate(id, data, { new: true });
    if (!brand) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");
    return brand;
};

export const deleteBrand = async (id: string) => {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");
    return brand;
};