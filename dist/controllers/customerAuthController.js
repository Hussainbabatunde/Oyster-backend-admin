"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthController = void 0;
const customerAuthService_1 = require("../services/customerAuthService");
class CustomerAuthController {
    static async signup(req, res) {
        try {
            const { firstName, lastName, email, password, phone } = req.body;
            const result = await customerAuthService_1.CustomerAuthService.signup({
                firstName,
                lastName,
                email,
                password,
                phone,
            });
            return res.status(201).json({
                success: true,
                message: 'Customer account created successfully!',
                data: result,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Signup failed.',
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await customerAuthService_1.CustomerAuthService.login({ email, password });
            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                data: result,
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Login failed.',
            });
        }
    }
    static async me(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const profile = await customerAuthService_1.CustomerAuthService.getProfile(userId);
            return res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch customer profile.',
            });
        }
    }
}
exports.CustomerAuthController = CustomerAuthController;
