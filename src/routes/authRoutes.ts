import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public Authentication
router.post('/login', AuthController.login);
router.post('/signup', AuthController.signupSuperAdmin);
router.post('/register', AuthController.signupSuperAdmin);
router.post('/signup-super-admin', AuthController.signupSuperAdmin);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Super Admin User Management
router.get('/users', authenticateToken, requireSuperAdmin, AuthController.getUsers);
router.post('/users', authenticateToken, requireSuperAdmin, AuthController.createUser);
router.post('/create-user', authenticateToken, requireSuperAdmin, AuthController.createUser);
router.delete('/users/:id', authenticateToken, requireSuperAdmin, AuthController.deleteUser);

export default router;
