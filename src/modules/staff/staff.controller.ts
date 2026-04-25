import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as staffService from "./staff.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { STATUS_CODE } from "../../config/constants";

/**
 * @desc    Get staff statistics (Total, Active, Inactive)
 * @route   GET /api/staff/stats
 * @access  Private/Admin
 */
export const getStaffStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await staffService.getStaffStats();

    res.status(STATUS_CODE.OK).json(
        new ApiResponse(req.t("staff.stats_retrieved"), stats)
    );
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
    const newStaff = await staffService.createStaff(req.body);

    // Remove password from response
    const staffResponse = newStaff.toObject();
    delete staffResponse.password;

    res.status(STATUS_CODE.CREATED).json(
        new ApiResponse(req.t('staff.staff_created'), staffResponse)
    );
});

/**
 * @desc    Get all staff members with pagination
 * @route   GET /api/staff
 * @access  Private/Admin
 */
export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await staffService.getAllStaffService(req.query);
    res.json(new ApiResponse(req.t('staff.staff_retrieved'), data, meta));
});

/**
 * @desc    Get specific staff member details
 * @route   GET /api/staff/:id
 * @access  Private/Admin
 */
export const getStaffById = asyncHandler(async (req: Request, res: Response) => {
    const staff = await staffService.getStaffById(req.params.id as string);
    res.json(new ApiResponse(req.t('staff.staff_details_retrieved'), staff));
});

/**
 * @desc    Update staff profile or permissions
 * @route   PATCH /api/staff/:id
 * @access  Private/Admin
 */
export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, permissions, isActive } = req.body;
    const updateData: any = { firstName, lastName, email, phone, permissions, isActive };
    const files = req.files as any;

    if (files?.profileImage) {
        updateData.profileImage = files.profileImage[0].path;
    }

    const updatedStaff = await staffService.updateStaff(req.params.id as string, updateData);
    res.json(new ApiResponse(req.t('staff.staff_updated'), updatedStaff));
});

/**
 * @desc    Toggle staff active status
 * @route   PATCH /api/staff/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleStaffStatus = asyncHandler(async (req: Request, res: Response) => {
    const staff = await staffService.toggleStaffStatus(req.params.id as string);
    res.json(new ApiResponse(req.t('staff.status_toggled'), staff));
});

/**
 * @desc    Delete staff member (Admin only, cannot delete self)
 * @route   DELETE /api/staff/:id
 * @access  Private/Admin
 */
export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
    const targetStaffId = req.params.id as string;
    const adminId = req.user!.id;

    // The service handles the check, but we pass the adminId to verify
    await staffService.deleteStaff(targetStaffId, adminId);

    res.json(new ApiResponse(req.t('staff.staff_deleted')));
});