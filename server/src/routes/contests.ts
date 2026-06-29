import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: {
        startTime: 'asc'
      },
      // Optionally filter by status (upcoming, live) or recently ended
      where: {
        endTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Ended within last 7 days
        }
      }
    });

    res.json(contests);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

export default router;
