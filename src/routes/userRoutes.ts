import { Router } from 'express';
import { getMe, getUserById, updatePreferences, updateProfile, toggleFavorite, getUserStats } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/me/stats', authenticate, getUserStats);
router.put('/preferences', authenticate, updatePreferences);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);
router.post('/favorites', authenticate, toggleFavorite);
router.get('/:id', authenticate, getUserById);

export default router;
