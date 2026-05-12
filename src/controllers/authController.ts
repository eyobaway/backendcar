import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, profileImage } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.USER, // Always default to USER on registration
            profileImage: profileImage || null
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN as any
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    } catch (error) {
        console.error('Backend Error in authController.ts:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, profileImage } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Sync profile image if provided (for social logins) and not already set
        if (profileImage && !user.profileImage) {
            await user.update({ profileImage });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN as any
        });

        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    } catch (error) {
        console.error('Backend Error in authController.ts:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: 'ID Token is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google Token' });
        }

        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create user for social login (generating a dummy password as it won't be used)
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await User.create({
                name: name || 'Google User',
                email,
                password: dummyPassword,
                role: UserRole.USER,
                profileImage: picture || null
            });
        } else if (picture && !user.profileImage) {
            await user.update({ profileImage: picture });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN as any
        });

        res.json({
            message: 'Google login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    } catch (error) {
        console.error('Backend Error in googleLogin:', error);
        res.status(500).json({ message: 'Error verifying Google account', error });
    }
};
