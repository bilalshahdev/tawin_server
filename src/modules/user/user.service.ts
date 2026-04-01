import { User } from "./user.model";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { sendEmail } from "../../services/email.service";
import { ConstructionBasketStatus } from "./user.types";
import { STATUS_CODE } from "../../config/constants";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const getAllUsersService = async (page: number = 1, limit: number = 10, search?: string) => {
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
        User.find(filter)
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 }),
        User.countDocuments(filter)
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
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");
    return user;
};

export const updateUser = async (id: string, updateData: any) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");

    // 1. Handle Profile Image Cleanup
    if (updateData.profileImage && user.profileImage && user.profileImage !== 'default.png') {
        await deleteFile(user.profileImage);
    }

    // 2. Handle Email Change Logic
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) throw new ApiError(STATUS_CODE.BAD_REQUEST, "Email already exists");

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
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");
    user.isVerified = !user.isVerified;
    return await user.save();
};

export const deleteUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");

    if (user.profileImage && user.profileImage !== 'default.png') {
        await deleteFile(user.profileImage);
    }

    return await User.findByIdAndDelete(id);
};

// construction basket
export const applyForBasket = async (userId: string, basketData: any) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");

    if (user.constructionBasket?.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "Already applied");
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
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "User not found");

    if (!user.constructionBasket?.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "Not applied");
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "Invalid status");
    }

    if (user.constructionBasket.status === status) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "Already same status");
    }

    user.constructionBasket.status = status as ConstructionBasketStatus;
    return await user.save();
};
