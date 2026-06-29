import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { pollCodeforcesContests, pollCodeforcesUserSubmissions } from './codeforces';
import { pollLeetcodeContests, pollLeetcodeUserSubmissions } from './leetcode';
import { pollAtcoderContests, pollAtcoderUserSubmissions } from './atcoder';
import { leaderboardService } from '../services/leaderboard.service';

const prisma = new PrismaClient();

export function startScheduler() {
  console.log('Starting polling scheduler...');

  // Every 10 minutes: Poll contests for all 3 platforms
  cron.schedule('*/10 * * * *', async () => {
    console.log('Running contest pollers...');
    await pollCodeforcesContests();
    await pollLeetcodeContests();
    await pollAtcoderContests();
  });

  // Every 15 minutes: Poll user submissions
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running user submission pollers...');
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { linkedCodeforcesHandle: { not: null } },
            { linkedLeetcodeUsername: { not: null } },
            { linkedAtcoderUsername: { not: null } }
          ]
        },
        select: {
          id: true,
          linkedCodeforcesHandle: true,
          linkedLeetcodeUsername: true,
          linkedAtcoderUsername: true,
        }
      });

      for (const user of users) {
        if (user.linkedCodeforcesHandle) {
          await pollCodeforcesUserSubmissions(user.id, user.linkedCodeforcesHandle);
        }
        if (user.linkedLeetcodeUsername) {
          await pollLeetcodeUserSubmissions(user.id, user.linkedLeetcodeUsername);
        }
        if (user.linkedAtcoderUsername) {
          await pollAtcoderUserSubmissions(user.id, user.linkedAtcoderUsername);
        }
      }
    } catch (error) {
      console.error('Error running user submission pollers:', error);
    }
  });

  // Every 60 minutes: Recompute CQI scores for leaderboard
  cron.schedule('0 * * * *', async () => {
    try {
      await leaderboardService.recomputeAllCQI();
    } catch (error) {
      console.error('Error recomputing CQI:', error);
    }
  });
}
