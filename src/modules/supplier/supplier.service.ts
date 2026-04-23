import { Supplier } from './supplier.model';
import { ISupplyLog, SupplyLog } from './supplyLog.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';

import {
    subDays, subHours, subMonths,
    eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval,
    format, isSameDay, isSameHour, isSameMonth
} from "date-fns";

export const getSupplierStats = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {


    const [totalSuppliers, activeSuppliers, inactiveSuppliers] = await Promise.all([
        Supplier.countDocuments(),
        Supplier.countDocuments({ isActive: true }),
        Supplier.countDocuments({ isActive: false })
    ]);


    const logsResult = await SupplyLog.aggregate([
        {
            $facet: {

                generalMetrics: [
                    {
                        $group: {
                            _id: null,
                            totalSpend: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
                            totalItemsProcured: { $sum: "$quantity" },
                            itemsInTons: {
                                $sum: { $cond: [{ $eq: ["$unit", "ton"] }, "$quantity", 0] }
                            },
                            itemsInPieces: {
                                $sum: { $cond: [{ $eq: ["$unit", "piece"] }, "$quantity", 0] }
                            }
                        }
                    }
                ],

                topSuppliers: [
                    {
                        $group: {
                            _id: "$supplier",
                            spend: { $sum: { $multiply: ["$costPrice", "$quantity"] } }
                        }
                    },
                    { $sort: { spend: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: "suppliers",
                            localField: "_id",
                            foreignField: "_id",
                            as: "details"
                        }
                    },
                    { $unwind: "$details" },
                    {
                        $project: {
                            name: "$details.name",
                            spend: 1
                        }
                    }
                ]
            }
        }
    ]);

    const metrics = logsResult[0].generalMetrics[0] || {
        totalSpend: 0, totalItemsProcured: 0, itemsInTons: 0, itemsInPieces: 0
    };

    const topSuppliers = logsResult[0].topSuppliers || [];


    const graphData = await generateSupplierTimeline(period);

    return {
        suppliers: {
            total: totalSuppliers,
            active: activeSuppliers,
            inactive: inactiveSuppliers
        },
        procurement: {
            totalSpend: metrics.totalSpend,
            totalItems: metrics.totalItemsProcured,
            byUnit: {
                tons: metrics.itemsInTons,
                pieces: metrics.itemsInPieces
            }
        },
        topSuppliers,
        graphData
    };
};

/**
 * Helper to generate zero-filled timeline for supplier procurement
 */
async function generateSupplierTimeline(period: string) {
    const now = new Date();
    let start: Date;
    let intervals: Date[];
    let dateFormat: string;

    if (period === 'day') {
        start = subHours(now, 23);
        intervals = eachHourOfInterval({ start, end: now });
        dateFormat = "HH:00";
    } else if (period === 'week') {
        start = subDays(now, 6);
        intervals = eachDayOfInterval({ start, end: now });
        dateFormat = "EEE";
    } else if (period === 'month') {
        start = subDays(now, 29);
        intervals = eachDayOfInterval({ start, end: now });
        dateFormat = "dd MMM";
    } else {
        start = subMonths(now, 11);
        intervals = eachMonthOfInterval({ start, end: now });
        dateFormat = "MMM yyyy";
    }

    const logs = await SupplyLog.find({ createdAt: { $gte: start } }) as unknown as ISupplyLog[];

    return intervals.map(interval => {
        const periodLogs = logs.filter(log => {
            if (period === 'day') return isSameHour(log.createdAt, interval);
            if (period === 'year') return isSameMonth(log.createdAt, interval);
            return isSameDay(log.createdAt, interval);
        });

        return {
            label: format(interval, dateFormat),
            spend: periodLogs.reduce((acc, curr) => acc + (curr.costPrice * curr.quantity), 0),
            items: periodLogs.reduce((acc, curr) => acc + curr.quantity, 0)
        };
    });
}

/**
 * Standard Supplier CRUD Operations
 */
export const createSupplier = async (data: any) => Supplier.create(data);

export const getSuppliers = async (query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) filter.name = new RegExp(query.search, 'i');

    const [suppliers, totalDocs] = await Promise.all([
        Supplier.find(filter).limit(limit).skip(skip).sort({ name: 1 }),
        Supplier.countDocuments(filter)
    ]);
    return { data: suppliers, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getSupplierById = async (id: string) => {
    const supplier = await Supplier.findById(id).populate('suppliedProducts', 'title price');
    if (!supplier) throw new ApiError(404, "Supplier not found");
    return supplier;
};

export const updateSupplier = async (id: string, data: any) =>
    Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteSupplier = async (id: string) => {
    const supplier = await Supplier.findById(id);
    if (!supplier) throw new ApiError(404, "Supplier not found");
    return await supplier.deleteOne();
};

/**
 * Stock Inflow Logic
 */
export const addStockInflow = async (data: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const supplier = await Supplier.findById(data.supplier);
        if (!supplier?.isActive) throw new ApiError(400, "Cannot add stock from inactive supplier");

        const log = await SupplyLog.create([data], { session });

        const product = await Product.findByIdAndUpdate(
            data.product,
            { $inc: { remainingPieces: data.quantity } },
            { session, new: true }
        );
        if (!product) throw new ApiError(404, "Product not found");

        await Supplier.findByIdAndUpdate(data.supplier, {
            $addToSet: { suppliedProducts: data.product }
        }, { session });

        await session.commitTransaction();
        return log[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getDetailedHistory = async (supplierId: string, query: any) => {
    const { page, limit, skip } = getPaginationOptions(query);

    const [logs, totalDocs] = await Promise.all([
        SupplyLog.find({ supplier: supplierId })
            .populate('product', 'title photo remainingPieces')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip),
        SupplyLog.countDocuments({ supplier: supplierId })
    ]);

    return { data: logs, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};