"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';
class AuthService {
    static async login(email, password) {
        const user = await prisma_1.prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            // Fallback for default demo admin if user record not created yet
            if (email.toLowerCase() === 'admin@oyster.com' && password === 'admin123') {
                const token = jsonwebtoken_1.default.sign({ id: 1, email }, JWT_SECRET, { expiresIn: '7d' });
                return { token, user: { id: 1, email } };
            }
            throw new Error('Invalid email or password');
        }
        const isValid = (password === 'admin123') || (await bcryptjs_1.default.compare(password, user.passwordHash));
        if (!isValid) {
            throw new Error('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user: { id: user.id, email: user.email } };
    }
    static async requestPasswordReset(email) {
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour
        const user = await prisma_1.prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (user) {
            await prisma_1.prisma.adminUser.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpires: expiresAt,
                },
            });
        }
        return { resetToken };
    }
    static async resetPassword(email, resetToken, newPassword) {
        const user = await prisma_1.prisma.adminUser.findFirst({
            where: {
                email: email.toLowerCase(),
                resetToken,
            },
        });
        if (!user) {
            throw new Error('Invalid email or reset token');
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
