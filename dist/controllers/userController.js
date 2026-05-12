"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.toggleFavorite = exports.updateProfile = exports.updatePreferences = exports.getUserById = exports.getMe = void 0;
const models_1 = require("../models");
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await models_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = getMe;
const getUserById = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'profileImage']
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.update({ preferences });
        res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
    }
    catch (error) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updatePreferences = updatePreferences;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let { name, profileImage, email } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Handle uploaded file if present
        if (req.file) {
            profileImage = req.file.location;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (profileImage)
            updateData.profileImage = profileImage;
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = await models_1.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updateData.email = email;
        }
        await user.update(updateData);
        res.json({ message: 'Profile updated successfully', user });
    }
    catch (error) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID is required' });
        }
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let favorites = user.favorites || [];
        if (typeof favorites === 'string') {
            try {
                favorites = JSON.parse(favorites);
            }
            catch (e) {
                favorites = [];
            }
        }
        const propIdStr = propertyId.toString();
        const index = favorites.indexOf(propIdStr);
        if (index > -1) {
            favorites = favorites.filter((id) => id !== propIdStr);
        }
        else {
            favorites = [...favorites, propIdStr];
        }
        await user.update({ favorites });
        res.json({ message: index > -1 ? 'Removed from favorites' : 'Added to favorites', favorites });
    }
    catch (error) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.toggleFavorite = toggleFavorite;
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await models_1.User.findByPk(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const agent = await models_1.Agent.findOne({ where: { userId } });
        const listingsCount = agent ? await models_1.Property.count({ where: { agentId: agent.id } }) : 0;
        let favs = user.favorites || [];
        if (typeof favs === 'string') {
            try {
                favs = JSON.parse(favs);
            }
            catch (e) {
                favs = [];
            }
        }
        const favoritesCount = favs.length;
        const unreadMessagesCount = await models_1.Message.count({ where: { receiverId: userId, read: false } });
        res.json({
            listingsCount,
            favoritesCount,
            unreadMessagesCount
        });
    }
    catch (error) {
        console.error('Backend Error in getUserStats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserStats = getUserStats;
