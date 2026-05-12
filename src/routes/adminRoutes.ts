import { Router } from 'express';
import { getAllUsers, deletePropertyAdmin, deleteAgentAdmin, getDashboardStats, updateUserRole, deleteUserAdmin, getAllMessagesAdmin } from '../controllers/adminController';
import { createArticle, updateArticle, deleteArticle } from '../controllers/articleController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Secure all paths under /api/admin using RBAC
router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/messages', getAllMessagesAdmin);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUserAdmin);
router.delete('/properties/:id', deletePropertyAdmin);
router.delete('/agents/:id', deleteAgentAdmin);

// News Management
router.post('/news', createArticle);
router.put('/news/:id', updateArticle);
router.delete('/news/:id', deleteArticle);

export default router;
