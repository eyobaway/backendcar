import { Router } from 'express';
import authRoutes from './authRoutes';
import propertyRoutes from './propertyRoutes';
import agentRoutes from './agentRoutes';
import articleRoutes from './articleRoutes';
import uploadRoutes from './uploadRoutes';
import userRoutes from './userRoutes';
import messageRoutes from './messageRoutes';
import aiRoutes from './aiRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/agents', agentRoutes);
router.use('/news', articleRoutes);
router.use('/media', uploadRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

export default router;
