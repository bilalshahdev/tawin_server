import { Brand } from "./brand.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";
import { IBrand } from "./brand.types";
import { getPaginationOptions } from "../../utils/pagination";
import { deleteFile } from "../../utils/deleteFile";

export const createBrand = async (data: Partial<IBrand>) => {
    const existing = await Brand.findOne({ "name.en": data.name?.en });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.brand_exists");
    return await Brand.create(data);
};

export const getAllBrands = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);

    const search = query?.search || '';
    const filter = query?.filter ? { ...query.filter } : {};

    if (search) {
        filter.$or = [
            { "name.en": { $regex: search, $options: 'i' } },
            { "name.ar": { $regex: search, $options: 'i' } }
        ];
    }

    // 3. Execute queries with pagination
    const [brands, totalDocs] = await Promise.all([
        Brand.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Brand.countDocuments(filter)
    ]);

    return {
        data: brands,
        meta: {
            page,
            limit,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit)
        }
    };
};

export const getBrandById = async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");
    return brand;
};

export const updateBrand = async (id: string, data: Partial<IBrand>) => {
    const existing = await Brand.findById(id);
    if (!existing) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");

    if (data.image && existing.image && data.image !== existing.image) {
        deleteFile(existing.image);
    }

    return await Brand.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBrand = async (id: string) => {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.brand_not_found");

    if (brand.image) deleteFile(brand.image);

    return brand;
};