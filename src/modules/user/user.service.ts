import { User } from "./user.model";
import bcrypt from 'bcryptjs';
import { sendEmail } from "../../services/email.service";

export const registerUser = async (data: any) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        ...data,
        password: hashedPassword
    });
    await sendEmail(
        user.email,
        "Welcome to Tawin!",
        `<h1>Hi ${user.firstName}</h1><p>Your account has been created.</p>`
    );

    return user;
};

export const verifyUserByAdmin = async (id: string) => {
    return await User.findByIdAndUpdate(id, { isVerified: true }, { new: true });
};

export const updateUserService = async (id: string, updateData: any) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const getAllUsersService = async () => {
    return await User.find();
};

export const getUserService = async (id: string) => {
    return await User.findById(id);
};
