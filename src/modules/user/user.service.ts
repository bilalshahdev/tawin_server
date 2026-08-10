import { STATUS_CODE } from "../../config/constants";
import { sendEmail } from "../../services/email.service";
import { Period } from "../../types/global.types";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { secureCardNumber } from "../../utils/cardSecurity";
import generateOTP from "../../utils/generateOtp";
import { fillBuckets, getTimelineBuckets } from "../../utils/graphHelper";
import { getPaginationOptions } from "../../utils/pagination";
import { getRollingDateRange } from "../admin/admin.utils";
import * as notificationService from '../notification/notification.service';
import { Staff } from "../staff/staff.model";
import { User } from "./user.model";
import { ConstructionBasketStatus } from "./user.types";

export const getUserStats = async (period: Period = 'daily') => {
    const buckets = getTimelineBuckets(period);
    const { currentStart, currentEnd } = getRollingDateRange(period);

    const users = await User.find({
        role: 'customer',
        createdAt: {
            $gte: currentStart,
            $lt: currentEnd,
        },
    })
        .select('createdAt')
        .lean();

    const graphData = fillBuckets(buckets, users, 'createdAt', period);

    const stats = await User.aggregate([
        {
            $match: {
                role: 'customer',
                createdAt: {
                    $gte: currentStart,
                    $lt: currentEnd,
                },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                verified: {
                    $sum: {
                        $cond: ['$isVerified', 1, 0],
                    },
                },
                unverified: {
                    $sum: {
                        $cond: ['$isVerified', 0, 1],
                    },
                },
            },
        },
    ]);

    const rawCards = stats[0] || {
        total: 0,
        verified: 0,
        unverified: 0,
    };

    return {
        summary: {
            period,
            cards: [
                {
                    title: 'Total Customers',
                    value: rawCards.total,
                    change: { type: 'increase', percentage: 100 },
                },
                {
                    title: 'Verified Customers',
                    value: rawCards.verified,
                    change: { type: 'increase', percentage: 100 },
                },
                {
                    title: 'Unverified Customers',
                    value: rawCards.unverified,
                    change: { type: 'increase', percentage: 0 },
                },
            ],
        },
        graph: graphData,
    };
};

export const getAllUsersService = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { search } = query;
    let filter = {};

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter = {
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { username: searchRegex }
            ]
        };
    }

    const [users, totalDocs] = await Promise.all([
        User.find({ ...filter, role: { $ne: 'admin' } })
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .lean(),
        User.countDocuments({ ...filter, role: { $ne: 'admin' } })
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
        data: users,
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

export const getUser = async (id: string, role?: string) => {
    const isStaff = role === 'staff';
    if (isStaff) {
        const user = await Staff.findById(id);
        if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
        return user;
    }
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    return user;
};

export const updateUser = async (id: string, updateData: any, isAdmin?: boolean) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");


    if (updateData.profileImage && user.profileImage && user.profileImage !== 'default-avatar.png') {
        await deleteFile(user.profileImage);
    }


    if (!isAdmin && updateData.email && updateData.email !== user.email) {
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

export const updateProfilePicture = async (id: string, newImagePath: string) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
        await deleteFile(user.profileImage);
    }

    return await User.findByIdAndUpdate(
        id,
        { $set: { profileImage: newImagePath } },
        { new: true }
    );
};


export const verifyUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    user.isVerified = !user.isVerified;
    await user.save();

    await notificationService.createNotification({
        recipient: user._id,
        recipientType: 'User',
        title: 'NOTIF_ACCOUNT_VERIFIED_TITLE',
        message: user.isVerified ? 'NOTIF_ACCOUNT_VERIFIED_MSG' : 'NOTIF_ACCOUNT_DEACTIVATED_MSG',
        type: 'auth'
    });

    return user;
};

export const deleteUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    }
    if (user.role === 'admin') {
        throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.admin_deletion_prohibited");
    }

    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
        deleteFile(user.profileImage);
    }

    return await User.findByIdAndDelete(userId);
};


export const applyForBasket = async (userId: string, basketData: any) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    if (user.constructionBasket?.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_applied");
    }

    const securedCard = basketData.masterCardNumber
        ? secureCardNumber(basketData.masterCardNumber)
        : {};

    user.constructionBasket = {
        fullRegistrationName: basketData.fullRegistrationName,
        phoneNumber: basketData.phoneNumber,
        monthlyIncome: basketData.monthlyIncome,
        occupation: basketData.occupation,
        unifiedCard: basketData.unifiedCard,
        residenceCard: basketData.residenceCard,
        ...securedCard,
        propertyArea: basketData.propertyArea,
        propertyType: basketData.propertyType,
        isApplied: true,
        status: 'pending'
    };

    const savedUser = await user.save();
    await notificationService.notifyAdmins({
        title: 'NOTIF_BASKET_APPLIED_TITLE',
        message: 'NOTIF_BASKET_APPLIED_MSG',
        type: 'basket'
    });

    return savedUser;
};

export const fetchAllBasketRequests = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { search } = query;
    let filter = {};
    if (search) {
        filter = {
            $or: [
                { "constructionBasket.fullRegistrationName": { $regex: search, $options: 'i' } },
                { "constructionBasket.phoneNumber": { $regex: search, $options: 'i' } },
                { "constructionBasket.email": { $regex: search, $options: 'i' } }
            ]
        };
    }
    const [basketRequests, totalDocs] = await Promise.all([
        User.find({ "constructionBasket.isApplied": true, ...filter })
            .select("firstName lastName email profileImage constructionBasket")
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments({ "constructionBasket.isApplied": true, ...filter })
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return {
        data: basketRequests,
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
    const updatedUser = await user.save();

    await notificationService.createNotification({
        recipient: user._id,
        recipientType: 'User',
        title: 'NOTIF_BASKET_STATUS_TITLE',
        message: `NOTIF_BASKET_${status.toUpperCase()}_MSG`,
        type: 'basket'
    });

    return updatedUser;
};


export const deleteConstructionBasket = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

    if (!user.constructionBasket || !user.constructionBasket.isApplied) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.no_construction_basket");
    }

    user.constructionBasket = undefined;

    return await user.save();
};
