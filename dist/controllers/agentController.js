"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentStats = exports.deleteAgent = exports.updateAgent = exports.createAgent = exports.updateMe = exports.getAgentById = exports.getAllAgents = void 0;
const models_1 = require("../models");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const getAllAgents = async (req, res) => {
    try {
        const { name, location, role } = req.query;
        const whereClause = { isActive: true };
        const userWhereClause = {};
        if (location) {
            whereClause.location = { [sequelize_1.Op.like]: `%${location}%` };
        }
        if (role) {
            whereClause.role = { [sequelize_1.Op.like]: `%${role}%` };
        }
        if (name) {
            userWhereClause.name = { [sequelize_1.Op.like]: `%${name}%` };
        }
        const agents = await models_1.Agent.findAll({
            where: whereClause,
            include: [
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'profileImage'],
                    where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
                },
                {
                    model: models_1.Property,
                    as: 'properties',
                    attributes: ['id']
                }
            ]
        });
        res.json(agents);
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: 'Error fetching agents', error });
    }
};
exports.getAllAgents = getAllAgents;
const getAgentById = async (req, res) => {
    try {
        const agent = await models_1.Agent.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { id: req.params.id },
                    { userId: req.params.id }
                ]
            },
            include: [
                { model: models_1.User, as: 'user', attributes: ['id', 'name', 'email', 'profileImage'] },
                { model: models_1.Property, as: 'properties' }
            ]
        });
        if (!agent)
            return res.status(404).json({ message: 'Agent not found' });
        res.json(agent);
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: 'Error fetching agent', error });
    }
};
exports.getAgentById = getAgentById;
const updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, phone, location, languages, isActive, role } = req.body;
        let agent = await models_1.Agent.findOne({ where: { userId } });
        let image = req.body.image;
        if (req.file) {
            image = req.file.location;
        }
        if (!agent) {
            // Create agent profile if it doesn't exist
            agent = await models_1.Agent.create({
                userId,
                bio,
                phone,
                location,
                languages,
                image,
                isActive: isActive || false,
                role: role || 'Real Estate Agent',
                listingsCount: 0
            });
            // Also update the user role to AGENT in the main User table
            const user = await models_1.User.findByPk(userId);
            if (user)
                await user.update({ role: User_1.UserRole.AGENT });
        }
        else {
            // Update existing agent profile
            const updateData = {
                bio,
                phone,
                location,
                languages,
                isActive,
                role
            };
            if (image)
                updateData.image = image;
            await agent.update(updateData);
        }
        res.json({ message: 'Agent profile updated successfully', agent });
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateMe = updateMe;
const createAgent = async (req, res) => {
    try {
        const { userId, bio, phone, location, languages, isActive, role } = req.body;
        let agent = await models_1.Agent.findOne({ where: { userId } });
        if (agent)
            return res.status(400).json({ message: 'Agent profile already exists for this user' });
        agent = await models_1.Agent.create({
            userId,
            bio,
            phone,
            location,
            languages,
            isActive: isActive !== undefined ? isActive : true,
            role: role || 'Real Estate Agent',
            listingsCount: 0
        });
        // Upgrade user role
        const user = await models_1.User.findByPk(userId);
        if (user)
            await user.update({ role: User_1.UserRole.AGENT });
        res.status(201).json({ message: 'Agent created successfully', agent });
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createAgent = createAgent;
const updateAgent = async (req, res) => {
    try {
        const agent = await models_1.Agent.findByPk(req.params.id);
        if (!agent)
            return res.status(404).json({ message: 'Agent not found' });
        const isAdmin = req.user?.role === 'ADMIN';
        const isOwner = agent.userId === req.user?.id;
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized to update this agent' });
        }
        const { bio, phone, location, languages, isActive, role } = req.body;
        const updateData = { bio, phone, location, languages, isActive, role };
        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        await agent.update(updateData);
        res.json({ message: 'Agent updated successfully', agent });
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateAgent = updateAgent;
const deleteAgent = async (req, res) => {
    try {
        const agent = await models_1.Agent.findByPk(req.params.id);
        if (!agent)
            return res.status(404).json({ message: 'Agent not found' });
        const isAdmin = req.user?.role === 'ADMIN';
        const isOwner = agent.userId === req.user?.id;
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized to delete this agent' });
        }
        // Optionally downgrade user role or just deactivate
        const user = await models_1.User.findByPk(agent.userId);
        if (user)
            await user.update({ role: User_1.UserRole.USER });
        await agent.destroy();
        res.json({ message: 'Agent deleted successfully' });
    }
    catch (error) {
        console.error('Backend Error in agentController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAgent = deleteAgent;
const getAgentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        let agent = await models_1.Agent.findOne({ where: { userId } });
        // Find inquiries
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const inquiries = await models_1.Message.findAll({
            where: { receiverId: userId, createdAt: { [sequelize_1.Op.gte]: sixMonthsAgo } }
        });
        // Grouping inquiries
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const engagementData = [];
        const getCreationDate = (item) => new Date(item.createdAt || item.created_at || item.dataValues?.createdAt || new Date());
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = monthNames[d.getMonth()];
            const month = d.getMonth();
            const year = d.getFullYear();
            const monthInquiries = inquiries.filter(m => getCreationDate(m).getMonth() === month && getCreationDate(m).getFullYear() === year).length;
            const mockViews = Math.floor(monthInquiries * 3.5) + Math.floor(Math.random() * 50);
            engagementData.push({
                month: monthLabel,
                views: mockViews,
                inquiries: monthInquiries
            });
        }
        // Get Listing Performance
        let listingPerformance = [];
        let propertyStatusStats = [];
        let avgPrice = 0;
        if (agent) {
            const properties = await models_1.Property.findAll({ where: { agentId: agent.id }, attributes: ['id', 'address', 'type', 'price'] });
            const allUsers = await models_1.User.findAll({ attributes: ['favorites'] });
            listingPerformance = properties.map((p) => {
                let count = 0;
                allUsers.forEach((u) => {
                    const favs = u.favorites || [];
                    if (favs.includes(p.id))
                        count++;
                });
                const shortName = (p.address || 'Property').split(',')[0].substring(0, 15);
                return { name: shortName, month: shortName, saved: count };
            });
            const statusMap = { SALE: 0, RENT: 0 };
            let totalP = 0;
            properties.forEach(p => {
                statusMap[p.type] = (statusMap[p.type] || 0) + 1;
                const pPrice = Number(p.price);
                if (!isNaN(pPrice))
                    totalP += pPrice;
            });
            propertyStatusStats = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
            avgPrice = properties.length > 0 ? totalP / properties.length : 0;
        }
        res.json({
            engagementData,
            listingPerformance,
            propertyStatusStats,
            summary: {
                avgPrice,
                totalListings: agent ? agent.properties?.length || 0 : 0
            }
        });
    }
    catch (error) {
        console.error('Error fetching agent stats:', error);
        res.status(500).json({ message: 'Error fetching agent stats', error });
    }
};
exports.getAgentStats = getAgentStats;
