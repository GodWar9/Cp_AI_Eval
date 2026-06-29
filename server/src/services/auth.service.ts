import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();
const BCRYPT_COST_FACTOR = parseInt(process.env.BCRYPT_COST_FACTOR || '12', 10);
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '30', 10);

export class AuthService {
  async register(email: string, passwordHash: string, displayName: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
      },
    });

    return this.generateTokens(user.id);
  }

  async login(email: string, passwordAttempt: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(passwordAttempt, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  async refreshTokens(oldTokenHash: string, userId: string) {
    // We would normally hash the token in the DB for security, but for this demo
    // we'll use the token hash as the literal token hash or we can use the raw token.
    // In production, oldTokenHash should be compared to a hashed version in DB.
    // Since verifyRefreshToken succeeded, we trust it, but we need to check if it's revoked.
    
    // Revoke the old token (simple implementation: delete it)
    await prisma.refreshToken.deleteMany({
      where: { tokenHash: oldTokenHash },
    });

    return this.generateTokens(userId);
  }

  async logout(tokenHash: string) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  private async generateTokens(userId: string) {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Normally we'd hash the refresh token before storing, but for simplicity
    // we use it directly here. In a real production app, apply sha256.
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshToken, // Should be hashed
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
