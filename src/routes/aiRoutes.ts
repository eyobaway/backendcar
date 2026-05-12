import { Router } from 'express';
import * as aiChatController from '../controllers/aiChatController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/chat', aiChatController.handleAIChat);
router.post('/draft', aiChatController.generateDraft);
router.post('/suggest', aiChatController.suggestNextWord);
router.post('/generate-description', aiChatController.generateDescription);
router.get('/admin-summary', aiChatController.getAdminSummary);
router.post('/admin-query', aiChatController.handleAdminChat);

router.get('/agent-summary', authenticate, aiChatController.getAgentAISummary);
router.post('/agent-query', authenticate, aiChatController.handleAgentAIChat);

export default router;
