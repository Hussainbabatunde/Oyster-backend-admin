import { Request, Response } from 'express';
import { CustomerAuthService } from '../services/customerAuthService';

export class CustomerAuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
      const result = await CustomerAuthService.signup({
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Signup failed.',
      });
    }
  }


  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await CustomerAuthService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Login failed.',
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const profile = await CustomerAuthService.getProfile(userId);
      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch customer profile.',
      });
    }
  }
}
