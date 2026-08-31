"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }
            const result = await authService_1.AuthService.login(email, password);
            return res.json({ success: true, ...result });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message || 'Invalid credentials' });
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }
            const { resetToken } = await authService_1.AuthService.requestPasswordReset(email);
            return res.json({
                success: true,
                message: `Password reset token sent to ${email}`,
                demoResetToken: resetToken,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { email, resetToken, newPassword } = req.body;
            if (!email || !resetToken || !newPassword) {
                return res.status(400).json({ success: false, message: 'Email, reset token, and new password are required' });
            }
            await authService_1.AuthService.resetPassword(email, resetToken, newPassword);
            return res.json({ success: true, message: 'Password reset successful' });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message || 'Reset failed' });
        }
    }
}
exports.AuthController = AuthController;
