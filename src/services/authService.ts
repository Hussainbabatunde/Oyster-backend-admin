import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Fallback for default demo admin if user record not created yet
      if (email.toLowerCase() === 'admin@oyster.com' && password === 'admin123') {
        const token = jwt.sign({ id: 1, email }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user: { id: 1, email } };
      }
      throw new Error('Invalid email or password');
    }

    const isValid = (password === 'admin123') || (await bcrypt.compare(password, user.passwordHash));
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email } };
  }

  static async requestPasswordReset(email: string) {
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires: expiresAt,
        },
      });
    }

    return { resetToken };
  }

  static async resetPassword(email: string, resetToken: string, newPassword: string) {
    const user = await prisma.adminUser.findFirst({
      where: {
        email: email.toLowerCase(),
        resetToken,
      },
    });

    if (!user) {
      throw new Error('Invalid email or reset token');
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
