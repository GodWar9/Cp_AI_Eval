import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { verifyRefreshToken } from '../utils/jwt';

const router = Router();
const BCRYPT_COST_FACTOR = parseInt(process.env.BCRYPT_COST_FACTOR || '12', 10);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Cookie options for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '30') * 24 * 60 * 60 * 1000,
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
    
    const { accessToken, refreshToken } = await authService.register(email, passwordHash, displayName);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({ accessToken });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const { accessToken, refreshToken } = await authService.login(email, password);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = await authService.refreshTokens(refreshToken, decoded.userId);
    
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.json({ accessToken: tokens.accessToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
