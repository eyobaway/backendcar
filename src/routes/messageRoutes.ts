import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getConversations, getChatHistory, markAsRead, createMessage } from '../controllers/messageController';

const router = express.Router();

// Require auth for all message routes
router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/:partnerId', getChatHistory);
router.put('/:partnerId/read', markAsRead);
router.post('/', createMessage);

export default router;
