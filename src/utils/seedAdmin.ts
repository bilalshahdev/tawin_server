// src/utils/seedAdmin.ts
import { User } from '../modules/user/user.model';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@tawin.com';
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);

            await User.create({
                firstName: 'System',
                lastName: 'Administrator',
                username: 'superadmin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true, // Admin is verified by default
                country: 'Global',
                // Explicitly ensuring no construction basket data
                constructionBasket: {
                    isApplied: false,
                    status: 'approved'
                }
            });
            console.log('✅ Initial admin account created successfully.');
        }
    } catch (error) {
        console.error('❌ Admin seeding failed:', error);
    }
};