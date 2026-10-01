"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public Authentication
router.post('/login', authController_1.AuthController.login);
router.post('/signup', authController_1.AuthController.signupSuperAdmin);
router.post('/register', authController_1.AuthController.signupSuperAdmin);
router.post('/signup-super-admin', authController_1.AuthController.signupSuperAdmin);
router.post('/forgot-password', authController_1.AuthController.forgotPassword);
router.post('/reset-password', authController_1.AuthController.resetPassword);
// Super Admin User Management
router.get('/users', authMiddleware_1.authenticateToken, authMiddleware_1.requireSuperAdmin, authController_1.AuthController.getUsers);
router.post('/users', authMiddleware_1.authenticateToken, authMiddleware_1.requireSuperAdmin, authController_1.AuthController.createUser);
router.post('/create-user', authMiddleware_1.authenticateToken, authMiddleware_1.requireSuperAdmin, authController_1.AuthController.createUser);
router.delete('/users/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireSuperAdmin, authController_1.AuthController.deleteUser);
exports.default = router;
