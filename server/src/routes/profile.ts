import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        cqiScores: {
          orderBy: { computedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update linked platforms
router.patch('/me/platforms', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { codeforces, leetcode, atcoder, github } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        linkedCodeforcesHandle: codeforces !== undefined ? codeforces : undefined,
        linkedLeetcodeUsername: leetcode !== undefined ? leetcode : undefined,
        linkedAtcoderUsername: atcoder !== undefined ? atcoder : undefined,
        linkedGithubUsername: github !== undefined ? github : undefined,
      }
    });

    res.json({ message: 'Platforms updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update platforms' });
  }
});

// Get user submissions
router.get('/:userId/submissions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId === 'me' ? req.user!.id : req.params.userId;
    
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 100
    });

    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get public profile
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        linkedCodeforcesHandle: true,
        linkedLeetcodeUsername: true,
        linkedAtcoderUsername: true,
        cqiScores: {
          orderBy: { computedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
