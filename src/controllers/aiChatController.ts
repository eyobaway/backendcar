import { Request, Response } from 'express';
import { Property, User, Agent, Message } from '../models';
import aiService from '../services/aiService';
import { Op } from 'sequelize';

export const handleAIChat = async (req: Request, res: Response) => {
    try {
        const { message, contextPropertyId } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const properties = await Property.findAll({
            attributes: ['id', 'price', 'make', 'model', 'year', 'transmission', 'fuelType', 'mileage', 'description'],
            limit: 20
        });

        let contextProperty = null;
        if (contextPropertyId) {
            try {
                const found = await Property.findByPk(contextPropertyId, {
                    attributes: ['id', 'price', 'make', 'model', 'year', 'transmission', 'fuelType', 'mileage', 'description']
                });
                if (found) {
                    contextProperty = found.toJSON();
                }
            } catch (err) {
                console.error("Error fetching context property:", err);
            }
        }

        const aiResponse = await aiService.getPropertyRecommendations(message, properties.map(p => ({
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

        let matchedIds: string[] = [];
        const matchIdsRegex = /MATCHED_IDS:\s*([a-f\d\-,\s]+)/i;
        const match = aiResponse.match(matchIdsRegex);

        if (match && match[1]) {
            matchedIds = match[1].split(',').map(id => id.trim()).filter(id => id.length > 0);
        }

        const cleanMessage = aiResponse.replace(matchIdsRegex, '').trim();

        let matchedProperties: { id: string, title: string }[] = [];
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
    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};

export const generateDraft = async (req: Request, res: Response) => {
    try {
        const { type, propertyContext, lastMessages } = req.body;
        if (!type) return res.status(400).json({ message: 'Draft type is required' });
        const draft = await aiService.generateMessageDraft(type, propertyContext, lastMessages);
        res.json({ draft });
    } catch (error: any) {
        console.error("Gemini AI Drafting Error:", error);
        res.status(500).json({ message: 'AI Suggestion is temporarily unavailable' });
    }
};

export const suggestNextWord = async (req: Request, res: Response) => {
    try {
        const { currentText, propertyContext, lastMessages } = req.body;
        if (!currentText || currentText.trim().length === 0) return res.json({ suggestion: '' });
        const suggestion = await aiService.generateAutocomplete(currentText, propertyContext, lastMessages);
        res.json({ suggestion });
    } catch (error: any) {
        console.error("Gemini AI Suggest Error:", error);
        res.json({ suggestion: '' });
    }
};

export const generateDescription = async (req: Request, res: Response) => {
    try {
        const { details } = req.body;
        if (!details) return res.status(400).json({ message: 'Vehicle details are required' });
        const description = await aiService.generatePropertyDescription(details);
        res.json({ description });
    } catch (error: any) {
        console.error("Gemini AI Description Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};

const getPlatformStats = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [users, agents, properties, totalUsers, totalAgents, totalProperties, totalInquiries] = await Promise.all([
        User.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } }, attributes: ['createdAt', 'role'] }),
        Agent.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } }, attributes: ['createdAt'] }),
        Property.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } }, attributes: ['createdAt', 'type', 'city'] }),
        User.count(),
        Agent.count(),
        Property.count(),
        Message.count()
    ]);

    return {
        totals: { totalUsers, totalAgents, totalProperties, totalInquiries },
        recentGrowth: {
            newUsersLast6Months: users.length,
            newDealersLast6Months: agents.length,
            newVehiclesLast6Months: properties.length
        },
        propertyMix: properties.reduce((acc: any, p) => {
            acc[p.type] = (acc[p.type] || 0) + 1;
            return acc;
        }, {}),
        topCities: properties.reduce((acc: any, p) => {
            acc[p.city] = (acc[p.city] || 0) + 1;
            return acc;
        }, {})
    };
};

export const getAdminSummary = async (req: Request, res: Response) => {
    try {
        const stats = await getPlatformStats();
        const summary = await aiService.generateAdminPerformanceSummary(stats);
        res.json({ summary });
    } catch (error: any) {
        console.error("Gemini AI Admin Summary Error:", error);
        res.status(500).json({ message: 'AI Summary is temporarily unavailable' });
    }
};

export const handleAdminChat = async (req: Request, res: Response) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const stats = await getPlatformStats();
        const response = await aiService.getAdminChatResponse(stats, message, history);
        res.json({ reply: response });
    } catch (error: any) {
        console.error("Gemini AI Admin Chat Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};

const getAgentPerformanceStats = async (userId: string) => {
    let agent = await Agent.findOne({ where: { userId }});
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const inquiries = await Message.count({ 
        where: { receiverId: userId, createdAt: { [Op.gte]: sixMonthsAgo } } 
    });

    let listingPerformance: any[] = [];
    let propertyStatusStats: any[] = [];
    let avgPrice = 0;
    let totalListings = 0;
    
    if (agent) {
         const properties = await Property.findAll({ where: { agentId: agent.id }, attributes: ['id', 'make', 'model', 'year', 'price', 'type'] });
         totalListings = properties.length;
         
         const allUsers = await User.findAll({ attributes: ['favorites'] });
         
         listingPerformance = properties.map((p: any) => {
             let count = 0;
             allUsers.forEach((u: any) => {
                 const favs = u.favorites || [];
                 if (favs.includes(p.id)) count++;
             });
             return { id: p.id, title: `${p.make} ${p.model}`, saved: count, type: p.type, price: p.price };
         });

         const statusMap: Record<string, number> = { SALE: 0, RENT: 0 };
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

export const getAgentAISummary = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const stats = await getAgentPerformanceStats(userId);
        const summary = await aiService.generateAgentPerformanceSummary(stats);
        res.json({ summary });
    } catch (error: any) {
        console.error("Gemini AI Agent Summary Error:", error);
        res.status(500).json({ message: 'AI Summary is temporarily unavailable' });
    }
};

export const handleAgentAIChat = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const stats = await getAgentPerformanceStats(userId);
        const response = await aiService.getAgentChatResponse(stats, message, history);
        res.json({ reply: response });
    } catch (error: any) {
        console.error("Gemini AI Agent Chat Error:", error);
        res.status(500).json({ message: 'AI Assistant is temporarily unavailable' });
    }
};
