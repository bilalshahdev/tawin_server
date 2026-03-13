import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";
import { ApiResponse } from "../../utils/apiResponse";

export const createUser = asyncHandler(async (req: Request, res: Response) => {

    const files = req.files as any;

    const avatar = files?.avatar?.[0]?.path;
    const images = files?.images?.map((img: any) => img.path) || [];
    const resume = files?.resume?.[0]?.path;

    const user = await userService.createUserService({
        ...req.body,
        avatar,
        images,
        resume
    });

    res.json(new ApiResponse("User created", user));
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await userService.getUsersService(page, limit);

    res.json({
        success: true,
        message: "Users fetched",
        data: result.users,
        meta: result.meta
    });

});