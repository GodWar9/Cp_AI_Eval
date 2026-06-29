import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-do-not-use-in-prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-do-not-use-in-prod';

export interface JwtPayload {
  userId: string;
}

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
