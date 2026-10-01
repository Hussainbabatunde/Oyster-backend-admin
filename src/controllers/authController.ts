import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types';

export class AuthController {
  static async signupSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, secretKey } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const result = await AuthService.signupSuperAdmin({ name, email, password, secretKey });
      return res.status(201).json({ success: true, message: 'Super Admin registered successfully', ...result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Signup failed' });
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await AuthService.createUser({ name, email, password, role });
      return res.status(201).json({ success: true, message: `${user.role} user created successfully`, user });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'User creation failed' });
    }
  }

  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.getAllUsers();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch users' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
      }

      const currentUserId = req.user?.id || 0;
      await AuthService.deleteUser(id, currentUserId);
      return res.json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Delete user failed' });
    }
  }

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
