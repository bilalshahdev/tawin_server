import { config } from "../../config/env.config";
import { getPaginationOptions } from "../../utils/pagination";
import { Order, OrderStatus } from "../order/order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import { calculateGrowth, formatChange, getDateRange } from "./admin.utils";

// 1. Stats Card (Total Users, Orders, Sales + Comparison)
export const getStats = async (filter: string = 'daily') => {
    const { currentStart, prevStart, prevEnd } = getDateRange(filter);

    const getMetrics = async (start: Date, end?: Date) => {
        const query: any = { createdAt: { $gte: start } };
        if (end) query.createdAt.$lte = end;

        const [users, orders, salesAgg] = await Promise.all([
            User.countDocuments({ ...query, role: 'customer' }),
            Order.countDocuments(query),
            Order.aggregate([
                { $match: { ...query, status: 'delivered' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);
        return { users, orders, sales: salesAgg[0]?.total || 0 };
    };

    const current = await getMetrics(currentStart);
    const previous = await getMetrics(prevStart, prevEnd);

    return {
        totalUsers: { value: current.users, growth: calculateGrowth(current.users, previous.users) },
        totalOrders: { value: current.orders, growth: calculateGrowth(current.orders, previous.orders) },
        totalSales: { value: current.sales, growth: calculateGrowth(current.sales, previous.sales) }
    };
};

export const getSalesReport = async (filter: string) => {
    const { currentStart } = getDateRange(filter);

    // 1. Fetch data from DB
    const revenueHistory = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: currentStart },
                status: 'delivered'
            }
        },
        {
            $group: {
                _id: filter === 'daily'
                    ? { $hour: "$createdAt" }
                    : filter === 'weekly'
                        ? { $dayOfWeek: "$createdAt" } // 1 (Sun) to 7 (Sat)
                        : { $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] } }, // Week 1 to 5
                amount: { $sum: "$totalAmount" }
            }
        }
    ]);

    // 2. Initialize full range with 0 based on filter
    let fullHistory: { label: string, amount: number }[] = [];

    if (filter === 'daily') {
        // 24 Hours (0:00 to 23:00)
        for (let i = 0; i < 24; i++) {
            const record = revenueHistory.find(item => item._id === i);
            fullHistory.push({ label: `${i}:00`, amount: record ? record.amount : 0 });
        }
    } else if (filter === 'weekly') {
        // 7 Days
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.forEach((day, index) => {
            const record = revenueHistory.find(item => item._id === index + 1);
            fullHistory.push({ label: day, amount: record ? record.amount : 0 });
        });
    } else if (filter === 'monthly') {
        // 4-5 Weeks
        for (let i = 1; i <= 5; i++) {
            const record = revenueHistory.find(item => item._id === i);
            fullHistory.push({ label: `Week ${i}`, amount: record ? record.amount : 0 });
        }
    }

    // 3. Comprehensive Stats for the Report Section
    const [
        totalProducts,
        lowStock,
        outOfStock,
        totalCustomers,
        salesAgg
    ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ remainingPieces: { $lt: config.lowStockThreshold || 10 } }),
        Product.countDocuments({ remainingPieces: 0 }),
        User.countDocuments({ role: 'customer' }),
        Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ])
    ]);

    return {
        revenueHistory: fullHistory,
        inventory: {
            totalProducts,
            lowStock,
            outOfStock,
            totalCustomers,
            totalSales: salesAgg[0]?.total || 0
        }
    };
};

// 3. Sales by Region
export const getSalesByRegion = async () => {
    return await Order.aggregate([
        { $group: { _id: "$shippingAddress.city", orderCount: { $sum: 1 }, totalSales: { $sum: "$totalAmount" } } },
        { $project: { _id: 0, city: "$_id", orderCount: 1, totalSales: 1 } },
        { $sort: { totalSales: -1 } }
    ]);
};

// 4. Top Categories
export const getTopCategories = async () => {
    return await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
        { $unwind: "$p" },
        { $group: { _id: "$p.category", value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "c" } },
        { $unwind: "$c" },
        { $project: { _id: 0, name: "$c.name", value: 1 } }
    ]);
};

// 5. Financial Transfers
export const getFinancials = async (query: {search?: string, page?: number; limit?: number; status?: OrderStatus }) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const { status } = query;
    const filter: any = {};
    if (status) {
        filter.status = status;
    }
    if (query.search) {
        filter.$or = [
            { 'user.name': { $regex: query.search, $options: 'i' } },
            { 'user.email': { $regex: query.search, $options: 'i' } }
        ];
    }
    const [orders, totalDocs] = await Promise.all([
        Order.find(filter)
            .populate({ path: 'user', select: 'name email' })
            .select('totalAmount status createdAt user')
            .sort({ createdAt: -1 })
            .limit(10)
            .skip(skip)
            .lean(),
        Order.countDocuments(filter)
    ]);
    return { data: orders, meta: { page, limit, totalDocs, totalPages: Math.ceil(totalDocs / limit) } };
};

export const getFinancialStats = async (filter: string = 'weekly') => {
    const { currentStart, currentEnd, prevStart, prevEnd } = getDateRange(filter);

    const stats = await Order.aggregate([
        {
            $facet: {
                current: [
                    { $match: { createdAt: { $gte: currentStart, $lte: currentEnd } } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                            completed: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                            revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0] } }
                        }
                    }
                ],
                previous: [
                    { $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                            completed: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                            revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0] } }
                        }
                    }
                ]
            }
        }
    ]);

    const cur = stats[0].current[0] || { total: 0, pending: 0, completed: 0, cancelled: 0, revenue: 0 };
    const prev = stats[0].previous[0] || { total: 0, pending: 0, completed: 0, cancelled: 0, revenue: 0 };

    return {
        summary: {
            period: filter.charAt(0).toUpperCase() + filter.slice(1),
            cards: [
                {
                    title: "Transfers in Progress",
                    value: cur.pending,
                    change: formatChange(cur.pending, prev.pending)
                },
                {
                    title: "Total Transfers",
                    value: cur.total,
                    change: formatChange(cur.total, prev.total)
                },
                {
                    title: "Completed Transfers",
                    value: cur.completed,
                    change: formatChange(cur.completed, prev.completed)
                },
                {
                    title: "Cancelled Transfers",
                    value: cur.cancelled,
                    change: formatChange(cur.cancelled, prev.cancelled)
                }
            ]
        },
        Revenue: {
            revenue: cur.revenue,
            change: formatChange(cur.revenue, prev.revenue)
        }
    };
};

// 6. Top Selling Products
export const getTopProducts = async () => {
    return await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "d" } },
        { $unwind: "$d" },
        { $project: { name: "$d.name", totalSold: 1, price: "$d.price", image: { $arrayElemAt: ["$d.images", 0] } } }
    ]);
};

// 7. Dashboard Summary (Combine all)
export const getFullSummary = async (filter: string) => {
    const [stats, report, region, categories, financials, products] = await Promise.all([
        getStats(filter), getSalesReport(filter), getSalesByRegion(),
        getTopCategories(), getFinancials({ status: "delivered" }), getTopProducts()
    ]);

    return { stats, report, region, categories, financials: financials?.data || [], products };
};