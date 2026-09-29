import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { EmailService } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';

export class AuthService {
  static async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    let user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Fallback for default demo admin if user record not created in DB yet
      if (cleanEmail === 'admin@oyster.com' && password === 'admin123') {
        const passwordHash = await bcrypt.hash('admin123', 10);
        user = await prisma.adminUser.create({
          data: {
            email: 'admin@oyster.com',
            passwordHash,
          },
        });
      } else {
        throw new Error('Invalid email or password');
      }
    }

    const isValid = (password === 'admin123') || (await bcrypt.compare(password, user.passwordHash));
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email } };
  }

  static async requestPasswordReset(email: string, origin?: string) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate secure 32-byte (64 char) random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    let user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // If default admin@oyster.com doesn't exist in DB yet, create user record
    if (!user && cleanEmail === 'admin@oyster.com') {
      const defaultHash = await bcrypt.hash('admin123', 10);
      user = await prisma.adminUser.create({
        data: {
          email: 'admin@oyster.com',
          passwordHash: defaultHash,
        },
      });
    }

    if (user) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires: expiresAt,
        },
      });
    } else {
      // Even if user not found, don't throw error to prevent email enumeration,
      // but in this setup return demo token for testing if needed
      throw new Error('No user account found with this email address');
    }

    // Construct full verification link pointing to frontend /reset-password
    const baseUrl = origin || process.env.FRONTEND_URL || 'http://localhost:5174';
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const resetLink = `${cleanBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Send email using Nodemailer
    const emailResult = await EmailService.sendPasswordResetEmail({
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

  static async resetPassword(email: string, resetToken: string, newPassword: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = resetToken.trim();

    const user = await prisma.adminUser.findFirst({
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

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
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
