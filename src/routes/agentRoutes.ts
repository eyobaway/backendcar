import { Router } from 'express';
import { getAllAgents, getAgentById, updateMe, createAgent, updateAgent, deleteAgent, getAgentStats } from '../controllers/agentController';
import { authenticate } from '../middlewares/authMiddleware';

import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/', getAllAgents);
router.get('/me/stats', authenticate, getAgentStats);
router.put('/me', authenticate, upload.single('image'), updateMe);
router.get('/:id', getAgentById);
router.post('/', authenticate, createAgent);
router.put('/:id', authenticate, updateAgent);
router.delete('/:id', authenticate, deleteAgent);

export default router;
