"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAgentAIChat = exports.getAgentAISummary = exports.handleAdminChat = exports.getAdminSummary = exports.generateDescription = exports.suggestNextWord = exports.generateDraft = exports.handleAIChat = void 0;
const models_1 = require("../models");
const aiService_1 = __importDefault(require("../services/aiService"));
const sequelize_1 = require("sequelize");
const handleAIChat = async (req, res) => {
    try {
        const { message, contextPropertyId } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const properties = await models_1.Property.findAll({
            attributes: ['id', 'price', 'make', 'model', 'year', 'transmission', 'fuelType', 'mileage', 'description'],
            limit: 20
        });
        let contextProperty = null;
        if (contextPropertyId) {
            try {
                const found = await models_1.Property.findByPk(contextPropertyId, {
                    attributes: ['id', 'price', 'make', 'model', 'year', 'transmission', 'fuelType', 'mileage', 'description']
                });
                if (found) {
                    contextProperty = found.toJSON();
                }
            }
            catch (err) {
                console.error("Error fetching context property:", err);
            }
        }
        const aiResponse = await aiService_1.default.getPropertyRecommendations(message, properties.map(p => ({
            id: p.id,
            price: p.price,
            make: p.make,
            model: p.model,
            year: p.year,
            transmission: p.transmission,
            fuelType: p.fuelType,
            mileage: p.mileage,
            description: p.description
        })), contextProperty);
        let matchedIds = [];
        const matchIdsRegex = /MATCHED_IDS:\s*([a-f\d\-,\s]+)/i;
        const match = aiResponse.match(matchIdsRegex);
        if (match && match[1]) {
            matchedIds = match[1].split(',').map(id => id.trim()).filter(id => id.length > 0);
        }
        const cleanMessage = aiResponse.replace(matchIdsRegex, '').trim();
        let matchedProperties = [];
        if (matchedIds.length > 0) {
            matchedProperties = matchedIds.map(id => {
                const prop = properties.find(p => p.id === id);
                return {
                    id,
                    title: prop ? `${prop.make} ${prop.model} (${prop.year})` : `Vehicle #${id.substring(0, 8)}`
                };
            });
        }
        res.json({
            reply: cleanMessage,
            matchedIds,
            matchedProperties
        });
    }
    catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};
exports.handleAIChat = handleAIChat;
const generateDraft = async (req, res) => {
    try {
        const { type, propertyContext, lastMessages } = req.body;
        if (!type)
            return res.status(400).json({ message: 'Draft type is required' });
        const draft = await aiService_1.default.generateMessageDraft(type, propertyContext, lastMessages);
        res.json({ draft });
    }
    catch (error) {
        console.error("Gemini AI Drafting Error:", error);
        res.status(500).json({ message: 'AI Suggestion is temporarily unavailable' });
    }
};
exports.generateDraft = generateDraft;
const suggestNextWord = async (req, res) => {
    try {
        const { currentText, propertyContext, lastMessages } = req.body;
        if (!currentText || currentText.trim().length === 0)
            return res.json({ suggestion: '' });
        const suggestion = await aiService_1.default.generateAutocomplete(currentText, propertyContext, lastMessages);
        res.json({ suggestion });
    }
    catch (error) {
        console.error("Gemini AI Suggest Error:", error);
        res.json({ suggestion: '' });
    }
};
exports.suggestNextWord = suggestNextWord;
const generateDescription = async (req, res) => {
    try {
        const { details } = req.body;
        if (!details)
            return res.status(400).json({ message: 'Vehicle details are required' });
        const description = await aiService_1.default.generatePropertyDescription(details);
        res.json({ description });
    }
    catch (error) {
        console.error("Gemini AI Description Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};
exports.generateDescription = generateDescription;
const getPlatformStats = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const [users, agents, properties, totalUsers, totalAgents, totalProperties, totalInquiries] = await Promise.all([
        models_1.User.findAll({ where: { createdAt: { [sequelize_1.Op.gte]: sixMonthsAgo } }, attributes: ['createdAt', 'role'] }),
        models_1.Agent.findAll({ where: { createdAt: { [sequelize_1.Op.gte]: sixMonthsAgo } }, attributes: ['createdAt'] }),
        models_1.Property.findAll({ where: { createdAt: { [sequelize_1.Op.gte]: sixMonthsAgo } }, attributes: ['createdAt', 'type', 'city'] }),
        models_1.User.count(),
        models_1.Agent.count(),
        models_1.Property.count(),
        models_1.Message.count()
    ]);
    return {
        totals: { totalUsers, totalAgents, totalProperties, totalInquiries },
        recentGrowth: {
            newUsersLast6Months: users.length,
            newDealersLast6Months: agents.length,
            newVehiclesLast6Months: properties.length
        },
        propertyMix: properties.reduce((acc, p) => {
            acc[p.type] = (acc[p.type] || 0) + 1;
            return acc;
        }, {}),
        topCities: properties.reduce((acc, p) => {
            acc[p.city] = (acc[p.city] || 0) + 1;
            return acc;
        }, {})
    };
};
const getAdminSummary = async (req, res) => {
    try {
        const stats = await getPlatformStats();
        const summary = await aiService_1.default.generateAdminPerformanceSummary(stats);
        res.json({ summary });
    }
    catch (error) {
        console.error("Gemini AI Admin Summary Error:", error);
        res.status(500).json({ message: 'AI Summary is temporarily unavailable' });
    }
};
exports.getAdminSummary = getAdminSummary;
const handleAdminChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message)
            return res.status(400).json({ message: 'Message is required' });
        const stats = await getPlatformStats();
        const response = await aiService_1.default.getAdminChatResponse(stats, message, history);
        res.json({ reply: response });
    }
    catch (error) {
        console.error("Gemini AI Admin Chat Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};
exports.handleAdminChat = handleAdminChat;
const getAgentPerformanceStats = async (userId) => {
    let agent = await models_1.Agent.findOne({ where: { userId } });
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const inquiries = await models_1.Message.count({
        where: { receiverId: userId, createdAt: { [sequelize_1.Op.gte]: sixMonthsAgo } }
    });
    let listingPerformance = [];
    let propertyStatusStats = [];
    let avgPrice = 0;
    let totalListings = 0;
    if (agent) {
        const properties = await models_1.Property.findAll({ where: { agentId: agent.id }, attributes: ['id', 'make', 'model', 'year', 'price', 'type'] });
        totalListings = properties.length;
        const allUsers = await models_1.User.findAll({ attributes: ['favorites'] });
        listingPerformance = properties.map((p) => {
            let count = 0;
            allUsers.forEach((u) => {
                const favs = u.favorites || [];
                if (favs.includes(p.id))
                    count++;
            });
            return { id: p.id, title: `${p.make} ${p.model}`, saved: count, type: p.type, price: p.price };
        });
        const statusMap = { SALE: 0, RENT: 0 };
        let totalP = 0;
        properties.forEach(p => {
            statusMap[p.type] = (statusMap[p.type] || 0) + 1;
            totalP += Number(p.price) || 0;
        });
        propertyStatusStats = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        avgPrice = properties.length > 0 ? totalP / properties.length : 0;
    }
    return {
        inquiries,
        listingPerformance,
        propertyStatusStats,
        summary: { avgPrice, totalListings }
    };
};
const getAgentAISummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await getAgentPerformanceStats(userId);
        const summary = await aiService_1.default.generateAgentPerformanceSummary(stats);
        res.json({ summary });
    }
    catch (error) {
        console.error("Gemini AI Agent Summary Error:", error);
        res.status(500).json({ message: 'AI Summary is temporarily unavailable' });
    }
};
exports.getAgentAISummary = getAgentAISummary;
const handleAgentAIChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, history } = req.body;
        if (!message)
            return res.status(400).json({ message: 'Message is required' });
        const stats = await getAgentPerformanceStats(userId);
        const response = await aiService_1.default.getAgentChatResponse(stats, message, history);
        res.json({ reply: response });
    }
    catch (error) {
        console.error("Gemini AI Agent Chat Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};
exports.handleAgentAIChat = handleAgentAIChat;
