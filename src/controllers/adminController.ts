import { Request, Response } from 'express';
import { User, Property, Agent, Message } from '../models';
import { Op } from 'sequelize';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const deletePropertyAdmin = async (req: Request, res: Response) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        await property.destroy();
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property admin:', error);
        res.status(500).json({ message: 'Error deleting property', error });
    }
};

export const deleteAgentAdmin = async (req: Request, res: Response) => {
    try {
        const agent = await Agent.findByPk(req.params.id);
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        await agent.destroy();
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        console.error('Error deleting agent admin:', error);
        res.status(500).json({ message: 'Error deleting agent', error });
    }
};

export const deleteUserAdmin = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Don't allow deleting self
        if (user.id === (req as any).user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user admin:', error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.body;
        if (!['USER', 'AGENT', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({ role });

        // If promoted to AGENT, ensure an Agent profile exists
        if (role === 'AGENT') {
            const existingAgent = await Agent.findOne({ where: { userId: user.id } });
            if (!existingAgent) {
                await Agent.create({
                    userId: user.id,
                    role: 'Real Estate Agent',
                    isActive: true,
                    listingsCount: 0
                });
            } else if (!existingAgent.isActive) {
                await existingAgent.update({ isActive: true });
            }
        }

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error('Error updating user role admin:', error);
        res.status(500).json({ message: 'Error updating user role', error });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const users = await User.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } } });
        const agents = await Agent.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } } });
        const properties = await Property.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } } });
        
        // Vehicle type distribution (all time)
        const allProperties = await Property.findAll();
        const typeMap: Record<string, number> = { SEDAN: 0, SUV: 0, TRUCK: 0, COUPE: 0, VAN: 0, LUXURY: 0 };
        const cityMap: Record<string, number> = {};

        allProperties.forEach(p => {
            const type = p.bodyType?.toUpperCase() || 'SEDAN';
            if (!(type in typeMap)) typeMap[type] = 0;
            typeMap[type]++;

            const city = p.city || 'Unknown';
            cityMap[city] = (cityMap[city] || 0) + 1;
        });

        // User role distribution
        const userRoles = await User.findAll({ attributes: ['role'] });
        const roleMap: Record<string, number> = { USER: 0, AGENT: 0, ADMIN: 0 };
        userRoles.forEach(u => {
            roleMap[u.role] = (roleMap[u.role] || 0) + 1;
        });

        // Grouping
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthData = [];
        
        const getCreationDate = (item: any) => new Date(item.createdAt || item.created_at || item.dataValues?.createdAt || new Date());

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = monthNames[d.getMonth()];
            const month = d.getMonth();
            const year = d.getFullYear();
            
            const userCount = users.filter(u => getCreationDate(u).getMonth() === month && getCreationDate(u).getFullYear() === year).length;
            const agentCount = agents.filter(a => getCreationDate(a).getMonth() === month && getCreationDate(a).getFullYear() === year).length;
            const propertyCount = properties.filter(p => getCreationDate(p).getMonth() === month && getCreationDate(p).getFullYear() === year).length;
            
            growthData.push({
                month: monthLabel,
                users: userCount,
                agents: agentCount,
                properties: propertyCount
            });
        }
        
        // Top level stats
        const totalUsers = await User.count();
        const totalAgents = await Agent.count();
        const totalProperties = await Property.count();
        const totalInquiries = await Property.sequelize?.models.Message.count() || 0;

        res.json({
            growthData,
            typeDistribution: Object.entries(typeMap).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase()})` })),
            cityDistribution: Object.entries(cityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
            userDistribution: Object.entries(roleMap).map(([name, value]) => ({ name, value })),
            summary: {
                totalUsers,
                totalAgents,
                totalProperties,
                totalInquiries
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

export const getAllMessagesAdmin = async (req: Request, res: Response) => {
    try {
        const messages = await Message.findAll({
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profileImage'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'profileImage'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages admin:', error);
        res.status(500).json({ message: 'Error fetching inquiries', error });
    }
};
