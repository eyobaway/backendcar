import { Request, Response } from 'express';
import { Property, Agent, User } from '../models';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Op, literal, fn, col } from 'sequelize';

export const getAllProperties = async (req: Request, res: Response) => {
    try {
        const { type, city, maxPrice, agentId, make, fuelType, transmission, condition, minYear, maxYear, subType } = req.query;
        const where: any = {};

        if (type) where.type = type;
        if (city) where.city = { [Op.like]: `%${city}%` };
        if (agentId) where.agentId = agentId;
        if (make) where.make = { [Op.like]: `%${make}%` };
        if (fuelType) where.fuelType = fuelType;
        if (transmission) where.transmission = transmission;
        if (condition) where.condition = condition;
        if (maxPrice) where.price = { [Op.lte]: Number(maxPrice) };
        if (minYear || maxYear) {
            where.year = {};
            if (minYear) where.year[Op.gte] = Number(minYear);
            if (maxYear) where.year[Op.lte] = Number(maxYear);
        }
        if (subType) {
            const types = Array.isArray(subType) ? subType : (subType as string).split(',');
            where.bodyType = { [Op.in]: types };
        }

        const properties = await Property.findAll({
            where,
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            include: [{
                model: Agent,
                as: 'agent',
                attributes: ['id', 'role', 'bio', 'phone', 'location'],
                include: [{ 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email', 'profileImage'] 
                }]
            }]
        });
        res.json(properties);
    } catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error fetching properties', error });
    }
};

export const getNearbyProperties = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng query params are required' });
        }

        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        const radiusKm = parseFloat(radius as string);

        // Haversine formula approximation using SQL DECIMAL arithmetic
        // distance in km = R * acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lng2-lng1))
        // R = 6371 (Earth's radius in km)
        const haversine = literal(
            `(6371 * acos(cos(radians(${userLat})) * cos(radians(lat)) * cos(radians(lng) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(lat))))`
        );

        const properties = await Property.findAll({
            attributes: [
                'id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 
                'fuelType', 'color', 'condition', 'bodyType', 'address', 'city',
                'type', 'rentCycle', 'description', 'features',
                'lat', 'lng', 'image', 'images', 'createdAt',
                [haversine, 'distance']
            ],
            include: [{
                model: Agent,
                as: 'agent',
                attributes: ['id', 'role', 'bio', 'phone', 'location'],
                include: [{ 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email', 'profileImage'] 
                }]
            }],
            having: literal(`distance <= ${radiusKm}`),
            order: [[literal('distance'), 'ASC']],
            limit: 50,
        });

        res.json(properties);
    } catch (error) {
        console.error('Backend Error in getNearbyProperties:', error);
        res.status(500).json({ message: 'Error fetching nearby properties', error });
    }
};

export const getPropertyById = async (req: Request, res: Response) => {
    try {
        const property = await Property.findByPk(req.params.id, {
            include: [{
                model: Agent,
                as: 'agent',
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profileImage'] }]
            }]
        });
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error fetching property', error });
    }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        let agent = await Agent.findOne({ where: { userId: req.user?.id } });
        
        if (!agent) {
            // Auto-create agent profile
            agent = await Agent.create({
                userId: req.user?.id,
                role: 'Car Dealer',
                isActive: true,
                listingsCount: 0
            });
            
            // Upgrade user role to AGENT
            const user = await User.findByPk(req.user?.id);
            if (user && user.role !== 'AGENT') {
                await user.update({ role: 'AGENT' as any });
            }
        }

        const property = await Property.create({
            ...req.body,
            agentId: agent.id
        });

        // Increment agent listings count
        await agent.increment('listingsCount');

        res.status(201).json(property);
    } catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error creating property', error });
    }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const agent = await Agent.findOne({ where: { userId: req.user?.id } });
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isAdmin && (!agent || agent.id !== property.agentId)) {
            return res.status(403).json({ message: 'Unauthorized to update this property' });
        }

        await property.update(req.body);
        res.json(property);
    } catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error updating property', error });
    }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const agent = await Agent.findOne({ where: { userId: req.user?.id } });
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isAdmin && (!agent || agent.id !== property.agentId)) {
            return res.status(403).json({ message: 'Unauthorized to delete this property' });
        }

        await property.destroy();

        // Decrement agent listings count
        if (agent) {
            await agent.decrement('listingsCount');
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error deleting property', error });
    }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const agent = await Agent.findOne({ where: { userId } });
        
        if (!agent) {
            return res.json([]); // Not an agent, so no properties
        }

        const properties = await Property.findAll({
            where: { agentId: agent.id },
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(properties);
    } catch (error) {
        console.error('Backend Error in getMyProperties:', error);
        res.status(500).json({ message: 'Error fetching my properties', error });
    }
};

export const getSavedProperties = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let favorites = user.favorites || [];
        if (typeof favorites === 'string') {
            try { favorites = JSON.parse(favorites); } catch(e) { favorites = []; }
        }

        if (favorites.length === 0) {
            return res.json([]);
        }

        const properties = await Property.findAll({
            where: { id: { [Op.in]: favorites } },
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            include: [{
                model: Agent,
                as: 'agent',
                attributes: ['id', 'role', 'bio', 'phone', 'location'],
                include: [{ 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email', 'profileImage'] 
                }]
            }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(properties);
    } catch (error) {
        console.error('Backend Error in getSavedProperties:', error);
        res.status(500).json({ message: 'Error fetching saved properties', error });
    }
};
