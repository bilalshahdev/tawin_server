import { User } from "../../models/User.model";


export const createUserService = async (data: any) => {

    const user = await User.create(data);

    return user;
};

export const getUsersService = async (page: number, limit: number) => {

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit),
        User.countDocuments()
    ]);

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getUserService = async (id: string) => {

    return User.findById(id);
};

export const updateUserService = async (id: string, data: any) => {

    return User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUserService = async (id: string) => {

    return User.findByIdAndDelete(id);
};