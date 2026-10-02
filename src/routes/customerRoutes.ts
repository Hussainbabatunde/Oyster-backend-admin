import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, CustomerController.getAll);
router.get('/:id', authenticateToken, CustomerController.getById);

export default router;
