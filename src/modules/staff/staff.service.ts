import { AUTH_CONSTANTS, STATUS_CODE } from "../../config/constants";
import { ApiError } from "../../utils/apiError";
import { deleteFile } from "../../utils/deleteFile";
import { getPaginationOptions } from "../../utils/pagination";
import { Staff } from "./staff.model";
import bcrypt from 'bcryptjs';

/**
 * Get Staff Statistics - 3 Simple Cards
 */
export const getStaffStats = async () => {
    const stats = await Staff.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: ["$isActive", 1, 0] } },
                inactive: { $sum: { $cond: ["$isActive", 0, 1] } }
            }
        }
    ]);

    const rawCards = stats[0] || { total: 0, active: 0, inactive: 0 };

    return {
        summary: {
            cards: [
                {
                    title: "Total Staff",
                    value: rawCards.total
                },
                {
                    title: "Active Staff",
                    value: rawCards.active
                },
                {
                    title: "Inactive Staff",
                    value: rawCards.inactive
                }
            ]
        }
    };
};

export const createStaff = async (data: any) => {
    const existing = await Staff.findOne({ email: data.email });
    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.user_exists");

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password!, AUTH_CONSTANTS.SALT_ROUNDS);

    return await Staff.create({
        ...data,
        password: hashedPassword,
        isActive: true
    });
};

/**
 * List all Staff members
 */
export const getAllStaffService = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { search } = query;

    let filter: any = {};

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex }
        ];
    }

    const [staff, totalDocs] = await Promise.all([
        Staff.find(filter)
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .lean(),
        Staff.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
        data: staff,
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

/**
 * Get single staff member
 */
export const getStaffById = async (id: string) => {
    const staff = await Staff.findById(id).select("-password");
    if (!staff) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.staff_not_found");
    return staff;
};

/**
 * Update Staff Info & Permissions
 */
export const updateStaff = async (id: string, updateData: any) => {
    const staff = await Staff.findById(id);
    if (!staff) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.staff_not_found");

    if (updateData.profileImage && staff.profileImage && staff.profileImage !== 'default-avatar.png') {
        await deleteFile(staff.profileImage);
    }

    if (updateData.email && updateData.email !== staff.email) {
        const emailExists = await Staff.findOne({ email: updateData.email });
        if (emailExists) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.user_exists");
    }

    return await Staff.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select("-password");
};



export const toggleStaffStatus = async (staffId: string) => {
    // 1. Check if the staff member exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.staff_not_found");
    }

    // 3. Toggle the boolean
    staff.isActive = !staff.isActive;

    return await staff.save();
};

/**
 * Delete Staff 
 * Logic: Must be Admin, and cannot delete self.
 */
export const deleteStaff = async (staffId: string, requestedBy: string) => {
    // 1. Prevent self-deletion
    if (staffId === requestedBy) {
        throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.cannot_delete_self");
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
        throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.staff_not_found");
    }

    // 2. Clean up files
    if (staff.profileImage && staff.profileImage !== 'default-avatar.png') {
        await deleteFile(staff.profileImage);
    }

    return await Staff.findByIdAndDelete(staffId);
};