import { Router } from 'express';
import { CustomerAuthController } from '../controllers/customerAuthController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', CustomerAuthController.signup);
router.post('/login', CustomerAuthController.login);
router.get('/me', authenticateToken, CustomerAuthController.me);

export default router;
