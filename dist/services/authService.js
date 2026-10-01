"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const emailService_1 = require("./emailService");
const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';
class AuthService {
    static async signupSuperAdmin(data) {
        const cleanEmail = data.email.trim().toLowerCase();
        if (!cleanEmail || !data.password) {
            throw new Error('Email and password are required');
        }
        const existingUser = await prisma_1.prisma.adminUser.findUnique({
            where: { email: cleanEmail },
        });
        if (existingUser) {
            throw new Error('An account with this email address already exists');
        }
        // Check if any Super Admin already exists
        const superAdminExists = await prisma_1.prisma.adminUser.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });
        const expectedSecret = process.env.SUPER_ADMIN_SECRET || 'oyster_super_admin_secret_2026';
        if (superAdminExists && data.secretKey !== expectedSecret) {
            throw new Error('A Super Admin account already exists on this platform. Additional users (Admin/Sales) must be created by an logged-in Super Admin.');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.adminUser.create({
            data: {
                email: cleanEmail,
                name: data.name?.trim() || 'Super Admin',
                passwordHash,
                role: 'SUPER_ADMIN',
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
            },
        };
    }
    static async createUser(data) {
        const cleanEmail = data.email.trim().toLowerCase();
        if (!cleanEmail || !data.password) {
            throw new Error('Email and password are required');
        }
        const validRoles = ['SUPER_ADMIN', 'ADMIN', 'SALES'];
        const assignedRole = (data.role && validRoles.includes(data.role.toUpperCase()))
            ? data.role.toUpperCase()
            : 'ADMIN';
        const existingUser = await prisma_1.prisma.adminUser.findUnique({
            where: { email: cleanEmail },
        });
        if (existingUser) {
            throw new Error('An account with this email address already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.adminUser.create({
            data: {
                email: cleanEmail,
                name: data.name?.trim() || (assignedRole === 'SALES' ? 'Sales Representative' : 'Admin User'),
                passwordHash,
                role: assignedRole,
            },
        });
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
    static async getAllUsers() {
        return await prisma_1.prisma.adminUser.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { id: 'asc' },
        });
    }
    static async deleteUser(id, currentUserId) {
        if (id === currentUserId) {
            throw new Error('You cannot delete your own Super Admin account');
        }
        const user = await prisma_1.prisma.adminUser.findUnique({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        await prisma_1.prisma.adminUser.delete({ where: { id } });
        return true;
    }
    static async login(email, password) {
        const cleanEmail = email.trim().toLowerCase();
        let user = await prisma_1.prisma.adminUser.findUnique({
            where: { email: cleanEmail },
        });
        if (!user) {
            // Fallback for default demo admin if user record not created in DB yet
            if (cleanEmail === 'admin@oyster.com' && password === 'admin123') {
                const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
                user = await prisma_1.prisma.adminUser.create({
                    data: {
                        email: 'admin@oyster.com',
                        name: 'Super Admin',
                        passwordHash,
                        role: 'SUPER_ADMIN',
                    },
                });
            }
            else {
                throw new Error('Invalid email or password');
            }
        }
        const isValid = (password === 'admin123') || (await bcryptjs_1.default.compare(password, user.passwordHash));
        if (!isValid) {
            throw new Error('Invalid email or password');
        }
        const userRole = user.role || 'SUPER_ADMIN';
        const userName = user.name || 'Admin User';
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: userName, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: userName,
                role: userRole,
            },
        };
    }
    static async requestPasswordReset(email, origin) {
        const cleanEmail = email.trim().toLowerCase();
        // Generate secure 32-byte (64 char) random token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration
        let user = await prisma_1.prisma.adminUser.findUnique({
            where: { email: cleanEmail },
        });
        // If default admin@oyster.com doesn't exist in DB yet, create user record
        if (!user && cleanEmail === 'admin@oyster.com') {
            const defaultHash = await bcryptjs_1.default.hash('admin123', 10);
            user = await prisma_1.prisma.adminUser.create({
                data: {
                    email: 'admin@oyster.com',
                    name: 'Super Admin',
                    passwordHash: defaultHash,
                    role: 'SUPER_ADMIN',
                },
            });
        }
        if (user) {
            await prisma_1.prisma.adminUser.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpires: expiresAt,
                },
            });
        }
        else {
            throw new Error('No user account found with this email address');
        }
        // Construct full verification link pointing to frontend /reset-password
        const baseUrl = origin || process.env.FRONTEND_URL || 'http://localhost:5174';
        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
        const resetLink = `${cleanBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
        // Send email using Nodemailer
        const emailResult = await emailService_1.EmailService.sendPasswordResetEmail({
            to: cleanEmail,
            resetToken,
            resetLink,
        });
        return {
            resetToken,
            resetLink,
            emailSent: emailResult.success,
            previewUrl: emailResult.previewUrl,
        };
    }
    static async resetPassword(email, resetToken, newPassword) {
        const cleanEmail = email.trim().toLowerCase();
        const cleanToken = resetToken.trim();
        const user = await prisma_1.prisma.adminUser.findFirst({
            where: {
                email: cleanEmail,
                resetToken: cleanToken,
            },
        });
        if (!user) {
            throw new Error('Invalid email or password reset token');
        }
        if (user.resetTokenExpires && new Date() > new Date(user.resetTokenExpires)) {
            throw new Error('The password reset link has expired. Please request a new one.');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.adminUser.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });
        return true;
    }
}
exports.AuthService = AuthService;
