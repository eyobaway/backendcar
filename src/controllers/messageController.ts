import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Message, User } from '../models';
import { Op } from 'sequelize';

// Get a list of users the current user has chatted with
export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Find all messages where user is either sender or receiver
        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'profileImage'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'profileImage'] }
            ]
        });

        // Extract unique conversational partners and the latest message
        const conversationsMap = new Map();

        messages.forEach((msg: any) => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!partner) return;

            // Only store the latest message for the conversation
            if (!conversationsMap.has(partner.id)) {
                conversationsMap.set(partner.id, {
                    partner,
                    latestMessage: msg.content,
                    timestamp: msg.createdAt,
                    unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0
                });
            } else if (msg.receiverId === userId && !msg.read) {
                // Increment unread count if we've already stored the latest preview
                const existing = conversationsMap.get(partner.id);
                existing.unreadCount += 1;
            }
        });

        res.json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: 'Error fetching conversations', error });
    }
};

// Get chat history with a specific user
export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const partnerId = req.params.partnerId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']],
        });

        // Mark messages as read when fetched
        if (messages.length > 0) {
            await Message.update(
                { read: true },
                {
                    where: {
                        receiverId: userId,
                        senderId: partnerId,
                        read: false
                    }
                }
            );
        }

        res.json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: 'Error fetching chat history', error });
    }
};

// Mark a specific user's chat as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const partnerId = req.params.partnerId;

        await Message.update(
            { read: true },
            {
                where: {
                    receiverId: userId,
                    senderId: partnerId,
                    read: false
                }
            }
        );

        res.json({ message: "Marked as read" });
    } catch (error) {
        console.error('Backend Error in messageController.ts:', error);
        res.status(500).json({ message: 'Error updating read status', error });
    }
};

// Create a new message (API endpoint)
export const createMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'receiverId and content are required' });
        }

        const message = await Message.create({
            senderId: userId,
            receiverId,
            content,
            read: false
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Backend Error in createMessage:', error);
        res.status(500).json({ message: 'Error creating message', error });
    }
};
