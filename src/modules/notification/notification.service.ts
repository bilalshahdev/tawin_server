import { Notification, INotification } from './notification.model';
import { Types } from 'mongoose';
import { Staff } from '../staff/staff.model';
import { User } from '../user/user.model';

export const createNotification = async (data: Partial<INotification>) => {
    return await Notification.create(data);
};

export const notifyAdmins = async (data: Omit<Partial<INotification>, 'recipient' | 'recipientType'>) => {
    const admins = await Staff.find({ isActive: true }).select('_id');
    const notifications = admins.map(admin => ({
        ...data,
        recipient: admin._id,
        recipientType: 'Staff'
    }));
    return await Notification.insertMany(notifications);
};

export const getMyNotifications = async (recipientId: string, query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const notifications = await Notification.find({ recipient: new Types.ObjectId(recipientId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Notification.countDocuments({ recipient: recipientId });
    const unreadCount = await Notification.countDocuments({ recipient: recipientId, isRead: false });

    return {
        notifications,
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

export const markRead = async (id: string, recipientId: string) => {
    return await Notification.findOneAndUpdate(
        { _id: id, recipient: recipientId },
        { isRead: true },
        { new: true }
    );
};

export const markAllRead = async (recipientId: string) => {
    return await Notification.updateMany(
        { recipient: recipientId, isRead: false },
        { isRead: true }
    );
};

export const notifyAllCustomers = async (data: Omit<Partial<INotification>, 'recipient' | 'recipientType'>) => {
    const customers = await User.find({ role: 'customer' }).select('_id');
    const notifications = customers.map(customer => ({
        ...data,
        recipient: customer._id,
        recipientType: 'User'
    }));
    return await Notification.insertMany(notifications);
};