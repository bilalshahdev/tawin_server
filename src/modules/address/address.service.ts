import { Address } from "./address.model";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";

export const addAddress = async (userId: string, data: any) => {
    // Check if this is the user's first address
    const addressCount = await Address.countDocuments({ user: userId });

    // If it's the first address, it must be default
    if (addressCount === 0) {
        data.isDefault = true;
    }

    // If the new address is set as default, unset the previous default
    if (data.isDefault) {
        await Address.updateMany({ user: userId }, { isDefault: false });
    }

    return await Address.create({ ...data, user: userId });
};

export const getMyAddresses = async (userId: string) => {
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const updateAddress = async (addressId: string, userId: string, data: any) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.address_not_found");

    if (data.isDefault && !address.isDefault) {
        await Address.updateMany({ user: userId }, { isDefault: false });
    }

    return await Address.findByIdAndUpdate(addressId, data, { new: true });
};

export const deleteAddress = async (addressId: string, userId: string) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.address_not_found");

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If we deleted the default address, make the most recent one the new default
    if (wasDefault) {
        const latestAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
        if (latestAddress) {
            latestAddress.isDefault = true;
            await latestAddress.save();
        }
    }
    return address;
};

export const setDefaultAddress = async (addressId: string, userId: string) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.address_not_found");

    await Address.updateMany({ user: userId }, { isDefault: false });
    address.isDefault = true;
    return await address.save();
};