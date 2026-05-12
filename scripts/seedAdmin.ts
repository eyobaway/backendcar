import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import { UserRole } from '../src/models/User';
import sequelize from '../src/config/database';

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'admin@ptgr.com';
        const password = 'admin';

        const existingAdmin = await User.findOne({ where: { email } });
        if (existingAdmin) {
            console.log('Super admin already exists with email:', email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: UserRole.ADMIN,
        });

        console.log('Successfully seeded super admin user.');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding super admin:', error);
        process.exit(1);
    }
};

seedAdmin();
