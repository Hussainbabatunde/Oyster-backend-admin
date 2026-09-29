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

      // Extract origin header or referer for dynamic reset link construction
      let origin = req.headers.origin as string;
      if (!origin && req.headers.referer) {
        try {
          const urlObj = new URL(req.headers.referer);
          origin = urlObj.origin;
        } catch (e) {
          // ignore parsing error
        }
      }

      const { resetToken, resetLink, emailSent, previewUrl } = await AuthService.requestPasswordReset(email, origin);
      return res.json({
        success: true,
        message: `Password reset verification email sent to ${email}`,
        resetLink,
        demoResetToken: resetToken,
        emailSent,
        ...(previewUrl ? { previewUrl } : {}),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to process password reset request' });
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
