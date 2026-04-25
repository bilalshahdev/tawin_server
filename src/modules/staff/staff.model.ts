import { Schema, model } from 'mongoose';
import { IStaff } from './staff.types';

// 1. Define the Permission Sub-Schema
const permissionSchema = new Schema({
    module: {
        type: String,
        required: true,
        enum: [
            'dashboard', 'orders', 'users', 'staff', 'products',
            'construction-basket', 'reviews', 'suppliers',
            'coupon codes', 'financial transfers', 'brand', 'stock'
        ]
    },
    operations: {
        type: [String],
        required: true,
        enum: ['get', 'post', 'patch', 'put', 'delete'],
        default: []
    }
}, { _id: false });

// 2. Define the Main Staff Schema
const userSchema = new Schema<IStaff>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    profileImage: { type: String, default: 'default-avatar.png' },
    lastLogout: { type: Date },
    role: { 
        type: String, 
        default: 'staff', 
        enum: ['staff'], // Restricts it strictly to 'staff'
        immutable: true  // Prevents updates from changing this field
    },

    // Use the sub-schema here
    permissions: [permissionSchema]

}, { timestamps: true });

export const Staff = model<IStaff>('Staff', userSchema);