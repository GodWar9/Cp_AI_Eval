import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Fetch the latest CQI score for each user by joining or subquerying.
    // For simplicity, we just fetch distinct users and their most recent CQI score.
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      include: {
        cqiScores: {
          orderBy: {
            computedAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Format the response for the frontend
    const leaderboard = users.map(user => {
      const latestScore = user.cqiScores[0];
      return {
        id: user.id,
        name: user.displayName || user.email.split('@')[0],
        avatarUrl: user.avatarUrl,
        score: latestScore ? latestScore.score : 0,
        breakdown: latestScore ? latestScore.breakdown : null
      };
    });

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Add rank
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: skip + index + 1
    }));

    const totalUsers = await prisma.user.count();

    res.json({
      data: rankedLeaderboard,
      meta: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
