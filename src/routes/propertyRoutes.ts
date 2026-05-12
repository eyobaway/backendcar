import { Router } from 'express';
import { getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getNearbyProperties, getMyProperties, getSavedProperties } from '../controllers/propertyController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/nearby', getNearbyProperties);
router.get('/me', authenticate, getMyProperties);
router.get('/saved', authenticate, getSavedProperties);
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

export default router;
