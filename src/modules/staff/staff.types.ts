export type Operation = 'get' | 'post' | 'patch' | 'put' | 'delete';

export type StaffModule = 
    | 'dashboard' | 'orders' | 'users' | 'staff' | 'products' | 'sales'
    | 'construction-basket' | 'reviews' | 'suppliers' | 'coupon' 
    | 'financial' | 'brand' | 'stock';

export interface IPermission {
    module: StaffModule;
    operations: Operation[];
}

export interface IStaff {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    password?: string; 
    phone?: string;
    profileImage?: string;
    lastLogout?: Date;
    permissions: IPermission[];
    role: "staff"
    createdAt?: Date;
    updatedAt?: Date;
}