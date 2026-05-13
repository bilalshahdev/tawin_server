import * as S from "./report.service";
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { STATUS_CODE } from "../../config/constants";

export const createReport = async (req: Request, res: Response) => {
    const user = req.user?.id;
    const report = await S.createReport(req.body.message, user!);
    res.status(STATUS_CODE.CREATED).json(new ApiResponse("Report created", report));
};

export const getReports = async (req: Request, res: Response) => {
    const { data, meta } = await S.getReports(req.query);
    res.status(STATUS_CODE.OK).json(new ApiResponse("Reports retrieved", data, meta));
};

export const deleteReport = async (req: Request, res: Response) => {
    await S.deleteReport(req.params.id as string);
    res.status(STATUS_CODE.OK).json(new ApiResponse("Report deleted"));
};