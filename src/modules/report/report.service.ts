import { Report } from "./report.model";
import { getPaginationOptions } from "../../utils/pagination";

export const createReport = async (message: string, user: string) => {
    return await Report.create({ message, user });
};

export const getReports = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const [reports, totalDocs] = await Promise.all([
        Report.find().populate({
            path: 'user',
            select: 'name email profilePicture'
        }).skip(skip).limit(limit),
        Report.countDocuments()
    ]);
    return { data: reports, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const deleteReport = async (id: string) => {
    return await Report.findByIdAndDelete(id);
};