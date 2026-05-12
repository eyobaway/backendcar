import { Request, Response } from 'express';
import { User, Agent, Property, Message } from '../models';

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'profileImage']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { preferences } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ preferences });
        res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
    } catch (error: any) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        let { name, profileImage, email } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle uploaded file if present
        if (req.file) {
            profileImage = (req.file as any).location;
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (profileImage) updateData.profileImage = profileImage;
        
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updateData.email = email;
        }

        await user.update(updateData);
        res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { propertyId } = req.body;

        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID is required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let favorites = user.favorites || [];
        if (typeof favorites === 'string') {
            try { favorites = JSON.parse(favorites); } catch(e) { favorites = []; }
        }
        
        const propIdStr = propertyId.toString();
        const index = favorites.indexOf(propIdStr);

        if (index > -1) {
            favorites = favorites.filter((id: string) => id !== propIdStr);
        } else {
            favorites = [...favorites, propIdStr];
        }

        await user.update({ favorites });
        res.json({ message: index > -1 ? 'Removed from favorites' : 'Added to favorites', favorites });
    } catch (error: any) {
        console.error('Backend Error in userController.ts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const agent = await Agent.findOne({ where: { userId } });
        const listingsCount = agent ? await Property.count({ where: { agentId: agent.id } }) : 0;
        let favs = user.favorites || [];
        if (typeof favs === 'string') {
            try { favs = JSON.parse(favs); } catch(e) { favs = []; }
        }
        
        const favoritesCount = favs.length;
        const unreadMessagesCount = await Message.count({ where: { receiverId: userId, read: false } });

        res.json({
            listingsCount,
            favoritesCount,
            unreadMessagesCount
        });
    } catch (error: any) {
        console.error('Backend Error in getUserStats:', error);
        res.status(500).json({ message: error.message });
    }
};
