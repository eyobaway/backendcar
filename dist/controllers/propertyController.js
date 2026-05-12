"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedProperties = exports.getMyProperties = exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getPropertyById = exports.getNearbyProperties = exports.getAllProperties = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getAllProperties = async (req, res) => {
    try {
        const { type, city, maxPrice, agentId, make, fuelType, transmission, condition, minYear, maxYear, subType } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (city)
            where.city = { [sequelize_1.Op.like]: `%${city}%` };
        if (agentId)
            where.agentId = agentId;
        if (make)
            where.make = { [sequelize_1.Op.like]: `%${make}%` };
        if (fuelType)
            where.fuelType = fuelType;
        if (transmission)
            where.transmission = transmission;
        if (condition)
            where.condition = condition;
        if (maxPrice)
            where.price = { [sequelize_1.Op.lte]: Number(maxPrice) };
        if (minYear || maxYear) {
            where.year = {};
            if (minYear)
                where.year[sequelize_1.Op.gte] = Number(minYear);
            if (maxYear)
                where.year[sequelize_1.Op.lte] = Number(maxYear);
        }
        if (subType) {
            const types = Array.isArray(subType) ? subType : subType.split(',');
            where.bodyType = { [sequelize_1.Op.in]: types };
        }
        const properties = await models_1.Property.findAll({
            where,
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            include: [{
                    model: models_1.Agent,
                    as: 'agent',
                    attributes: ['id', 'role', 'bio', 'phone', 'location'],
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'profileImage']
                        }]
                }]
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error fetching properties', error });
    }
};
exports.getAllProperties = getAllProperties;
const getNearbyProperties = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng query params are required' });
        }
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        // Haversine formula approximation using SQL DECIMAL arithmetic
        // distance in km = R * acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lng2-lng1))
        // R = 6371 (Earth's radius in km)
        const haversine = (0, sequelize_1.literal)(`(6371 * acos(cos(radians(${userLat})) * cos(radians(lat)) * cos(radians(lng) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(lat))))`);
        const properties = await models_1.Property.findAll({
            attributes: [
                'id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission',
                'fuelType', 'color', 'condition', 'bodyType', 'address', 'city',
                'type', 'rentCycle', 'description', 'features',
                'lat', 'lng', 'image', 'images', 'createdAt',
                [haversine, 'distance']
            ],
            include: [{
                    model: models_1.Agent,
                    as: 'agent',
                    attributes: ['id', 'role', 'bio', 'phone', 'location'],
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'profileImage']
                        }]
                }],
            having: (0, sequelize_1.literal)(`distance <= ${radiusKm}`),
            order: [[(0, sequelize_1.literal)('distance'), 'ASC']],
            limit: 50,
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Backend Error in getNearbyProperties:', error);
        res.status(500).json({ message: 'Error fetching nearby properties', error });
    }
};
exports.getNearbyProperties = getNearbyProperties;
const getPropertyById = async (req, res) => {
    try {
        const property = await models_1.Property.findByPk(req.params.id, {
            include: [{
                    model: models_1.Agent,
                    as: 'agent',
                    include: [{ model: models_1.User, as: 'user', attributes: ['id', 'name', 'email', 'profileImage'] }]
                }]
        });
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    }
    catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error fetching property', error });
    }
};
exports.getPropertyById = getPropertyById;
const createProperty = async (req, res) => {
    try {
        let agent = await models_1.Agent.findOne({ where: { userId: req.user?.id } });
        if (!agent) {
            // Auto-create agent profile
            agent = await models_1.Agent.create({
                userId: req.user?.id,
                role: 'Car Dealer',
                isActive: true,
                listingsCount: 0
            });
            // Upgrade user role to AGENT
            const user = await models_1.User.findByPk(req.user?.id);
            if (user && user.role !== 'AGENT') {
                await user.update({ role: 'AGENT' });
            }
        }
        const property = await models_1.Property.create({
            ...req.body,
            agentId: agent.id
        });
        // Increment agent listings count
        await agent.increment('listingsCount');
        res.status(201).json(property);
    }
    catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error creating property', error });
    }
};
exports.createProperty = createProperty;
const updateProperty = async (req, res) => {
    try {
        const property = await models_1.Property.findByPk(req.params.id);
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        const agent = await models_1.Agent.findOne({ where: { userId: req.user?.id } });
        const isAdmin = req.user?.role === 'ADMIN';
        if (!isAdmin && (!agent || agent.id !== property.agentId)) {
            return res.status(403).json({ message: 'Unauthorized to update this property' });
        }
        await property.update(req.body);
        res.json(property);
    }
    catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error updating property', error });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const property = await models_1.Property.findByPk(req.params.id);
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        const agent = await models_1.Agent.findOne({ where: { userId: req.user?.id } });
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
    }
    catch (error) {
        console.error('Backend Error in propertyController.ts:', error);
        res.status(500).json({ message: 'Error deleting property', error });
    }
};
exports.deleteProperty = deleteProperty;
const getMyProperties = async (req, res) => {
    try {
        const userId = req.user.id;
        const agent = await models_1.Agent.findOne({ where: { userId } });
        if (!agent) {
            return res.json([]); // Not an agent, so no properties
        }
        const properties = await models_1.Property.findAll({
            where: { agentId: agent.id },
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Backend Error in getMyProperties:', error);
        res.status(500).json({ message: 'Error fetching my properties', error });
    }
};
exports.getMyProperties = getMyProperties;
const getSavedProperties = async (req, res) => {
    try {
        const userId = req.user.id;
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
        if (favorites.length === 0) {
            return res.json([]);
        }
        const properties = await models_1.Property.findAll({
            where: { id: { [sequelize_1.Op.in]: favorites } },
            attributes: ['id', 'title', 'price', 'make', 'model', 'year', 'mileage', 'transmission', 'fuelType', 'color', 'condition', 'bodyType', 'address', 'city', 'type', 'rentCycle', 'description', 'features', 'lat', 'lng', 'image', 'images', 'createdAt'],
            include: [{
                    model: models_1.Agent,
                    as: 'agent',
                    attributes: ['id', 'role', 'bio', 'phone', 'location'],
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'profileImage']
                        }]
                }],
            order: [['createdAt', 'DESC']]
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Backend Error in getSavedProperties:', error);
        res.status(500).json({ message: 'Error fetching saved properties', error });
    }
};
exports.getSavedProperties = getSavedProperties;
