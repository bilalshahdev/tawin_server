import { User } from "./user.model";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { sendEmail } from "../../services/email.service";
import { ConstructionBasketStatus } from "./user.types";
import { STATUS_CODE } from "../../config/constants";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const getAllUsersService = async (page: number = 1, limit: number = 10, search?: string) => {
    // fetch users but not admin
    const skip = (page - 1) * limit;
    let filter = {};

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter = {
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ]
        };
    }

    const [users, totalDocs] = await Promise.all([
        User.find({ ...filter, role: { $ne: 'admin' } })
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 }),
        User.countDocuments({ ...filter, role: { $ne: 'admin' } })
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
        users,
        meta: {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

export const getUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    return user;
};

export const updateUser = async (id: string, updateData: any) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    // 1. Handle Profile Image Cleanup
    if (updateData.profileImage && user.profileImage && user.profileImage !== 'default.png') {
        await deleteFile(user.profileImage);
    }

    // 2. Handle Email Change Logic
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.user_exists");

        const otp = generateOTP();
        updateData.isVerified = false;
        updateData.verificationOtp = otp;
        updateData.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await sendEmail(updateData.email, "Verify Your New Email", `Your code is: ${otp}`);
    }

    return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

// verify user 
export const verifyUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    user.isVerified = !user.isVerified;
    return await user.save();
};

export const deleteUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    }
    if (user.role === 'admin') {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.admin_deletion_prohibited");
    }

    return await User.findByIdAndDelete(userId);
};

// construction basket
export const applyForBasket = async (userId: string, basketData: any) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    if (user.constructionBasket?.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_applied");
    }

    user.constructionBasket = {
        fullRegistrationName: basketData.fullRegistrationName,
        phoneNumber: basketData.phoneNumber,
        monthlyIncome: basketData.monthlyIncome,
        occupation: basketData.occupation,
        unifiedCard: basketData.unifiedCard,
        residenceCard: basketData.residenceCard,
        propertyArea: basketData.propertyArea,
        propertyType: basketData.propertyType,
        isApplied: true,
        status: 'pending'
    };

    return await user.save();
};

export const fetchAllBasketRequests = async () => {
    return await User.find({ "constructionBasket.isApplied": true })
        .select("firstName lastName email profileImage constructionBasket");
};

export const updateBasketRequestStatus = async (userId: string, status: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    if (!user.constructionBasket?.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.not_applied");
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.invalid_status");
    }

    if (user.constructionBasket.status === status) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_same_status");
    }

    user.constructionBasket.status = status as ConstructionBasketStatus;
    return await user.save();
};
