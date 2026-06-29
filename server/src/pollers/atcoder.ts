import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function pollAtcoderContests() {
  try {
    // Kenkoooo API or official AtCoder scraped data could be used here.
    // For simplicity, we use the public Kenkoooo API.
    const response = await axios.get('https://kenkoooo.com/atcoder/resources/contests.json');
    const contests = response.data;
    
    const now = new Date();
    // To limit inserts, we only grab contests from the last 30 days and upcoming.
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    for (const c of contests) {
      const startTime = new Date(c.start_epoch_second * 1000);
      
      if (startTime.getTime() < thirtyDaysAgo) continue;

      const endTime = new Date((c.start_epoch_second + c.duration_second) * 1000);
      const status = now < startTime ? 'upcoming' : now > endTime ? 'ended' : 'live';

      await prisma.contest.upsert({
        where: {
          platform_externalId: {
            platform: 'atcoder',
            externalId: c.id,
          }
        },
        update: {
          status,
          name: c.title,
          startTime,
          endTime,
        },
        create: {
          platform: 'atcoder',
          externalId: c.id,
          name: c.title,
          status,
          startTime,
          endTime,
          url: `https://atcoder.jp/contests/${c.id}`
        }
      });
    }
    
    console.log('Polled AtCoder contests successfully.');
  } catch (error) {
    console.error('Error polling AtCoder contests:', error);
  }
}

export async function pollAtcoderUserSubmissions(userId: string, handle: string) {
  try {
    const response = await axios.get(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${handle}&epoch_second=0`);
    
    const submissions = response.data;
    
    // Sort by descending time and grab top 50 to avoid massive DB load
    submissions.sort((a: any, b: any) => b.epoch_second - a.epoch_second);
    const recentSubmissions = submissions.slice(0, 50);

    for (const sub of recentSubmissions) {
      const problemId = sub.problem_id;
      const problemName = problemId; // AtCoder API doesn't give problem name directly here, fallback to ID
      const verdict = sub.result; // 'AC', 'WA', 'TLE', etc.
      const submittedAt = new Date(sub.epoch_second * 1000);
      const language = sub.language;

      await prisma.submission.upsert({
        where: {
          userId_platform_problemId_submittedAt: {
            userId,
            platform: 'atcoder',
            problemId,
            submittedAt,
          }
        },
        update: {
          verdict,
        },
        create: {
          userId,
          platform: 'atcoder',
          problemId,
          problemName,
          verdict,
          language,
          submittedAt,
        }
      });
    }

    console.log(`Polled AtCoder submissions for handle: ${handle}`);
  } catch (error) {
    console.error(`Error polling AtCoder submissions for ${handle}:`, error);
  }
}
