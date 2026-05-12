"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const register = async (req, res) => {
    try {
        const { name, email, password, role, profileImage } = req.body;
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({
            name,
            email,
            password: hashedPassword,
            role: User_1.UserRole.USER, // Always default to USER on registration
            profileImage: profileImage || null
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    }
    catch (error) {
        console.error('Backend Error in authController.ts:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, profileImage } = req.body;
        const user = await models_1.User.findOne({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Sync profile image if provided (for social logins) and not already set
        if (profileImage && !user.profileImage) {
            await user.update({ profileImage });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    }
    catch (error) {
        console.error('Backend Error in authController.ts:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};
exports.login = login;
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
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
        let user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            // Create user for social login (generating a dummy password as it won't be used)
            const dummyPassword = await bcryptjs_1.default.hash(Math.random().toString(36), 10);
            user = await models_1.User.create({
                name: name || 'Google User',
                email,
                password: dummyPassword,
                role: User_1.UserRole.USER,
                profileImage: picture || null
            });
        }
        else if (picture && !user.profileImage) {
            await user.update({ profileImage: picture });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        res.json({
            message: 'Google login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
            token
        });
    }
    catch (error) {
        console.error('Backend Error in googleLogin:', error);
        res.status(500).json({ message: 'Error verifying Google account', error });
    }
};
exports.googleLogin = googleLogin;
