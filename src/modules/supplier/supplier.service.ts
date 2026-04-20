import { Supplier } from './supplier.model';
import { SupplyLog } from './supplyLog.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/apiError';
import { getPaginationOptions } from '../../utils/pagination';

// --- Supplier Profile Management ---

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
    // We don't delete logs to keep financial/inventory history, but we remove the supplier
    return await supplier.deleteOne();
};

// --- Supply Inflow & History ---

export const addStockInflow = async (data: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const supplier = await Supplier.findById(data.supplier);
        if (!supplier?.isActive) throw new ApiError(400, "Cannot add stock from inactive supplier");

        const log = await SupplyLog.create([data], { session });

        // Atomic update to Product Inventory
        const product = await Product.findByIdAndUpdate(
            data.product,
            { $inc: { remainingPieces: data.quantity } },
            { session, new: true }
        );
        if (!product) throw new ApiError(404, "Product not found");

        // Link product to supplier profile
        await Supplier.findByIdAndUpdate(data.supplier, {
            $addToSet: { suppliedProducts: data.product }
        }, { session });

        await session.commitTransaction();
        return log[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally { session.endSession(); }
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