import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Invalid credentials' });
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const { resetToken } = await AuthService.requestPasswordReset(email);
      return res.json({
        success: true,
        message: `Password reset token sent to ${email}`,
        demoResetToken: resetToken,
      });
    } catch (err: any) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, resetToken, newPassword } = req.body;
      if (!email || !resetToken || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, reset token, and new password are required' });
      }

      await AuthService.resetPassword(email, resetToken, newPassword);
      return res.json({ success: true, message: 'Password reset successful' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Reset failed' });
    }
  }
}
