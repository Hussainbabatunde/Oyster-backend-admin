import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';

export interface CustomerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface CustomerLoginData {
  email: string;
  password: string;
}

export class CustomerAuthService {
  static async signup(data: CustomerSignupData) {
    const { firstName, lastName, email, password, phone } = data;

    const cleanEmail = email?.trim()?.toLowerCase();
    const cleanFirstName = firstName?.trim();
    const cleanLastName = lastName?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanEmail || !password || !cleanFirstName || !cleanLastName || !cleanPhone) {
      throw new Error('All fields (First Name, Last Name, Email, Password, Phone) are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const existingUser = await prisma.customerUser.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw new Error('An account with this email address already exists. Please log in instead.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.customerUser.create({
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        passwordHash,
        phone: cleanPhone,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'CUSTOMER',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    };
  }

  static async login(data: CustomerLoginData) {
    const { email, password } = data;
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const user = await prisma.customerUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'CUSTOMER',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    };
  }

  static async getProfile(userId: number) {
    const user = await prisma.customerUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Customer profile not found.');
    }

    return user;
  }
}
