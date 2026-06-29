import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CF_API_BASE = 'https://codeforces.com/api';

export async function pollCodeforcesContests() {
  try {
    const response = await axios.get(`${CF_API_BASE}/contest.list`);
    if (response.data.status !== 'OK') {
      throw new Error('Codeforces API returned non-OK status');
    }

    const contests = response.data.result;
    
    // Process only upcoming and recent contests to avoid huge bulk inserts
    // e.g. Phase: BEFORE or CODING, or recently FINISHED
    for (const c of contests) {
      if (c.phase === 'BEFORE' || c.phase === 'CODING' || c.phase === 'FINISHED') {
        const status = c.phase === 'BEFORE' ? 'upcoming' : 
                       c.phase === 'CODING' ? 'live' : 'ended';

        const startTime = new Date(c.startTimeSeconds * 1000);
        const endTime = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);

        await prisma.contest.upsert({
          where: {
            platform_externalId: {
              platform: 'codeforces',
              externalId: c.id.toString(),
            }
          },
          update: {
            status,
            name: c.name,
            startTime,
            endTime,
          },
          create: {
            platform: 'codeforces',
            externalId: c.id.toString(),
            name: c.name,
            status,
            startTime,
            endTime,
            url: `https://codeforces.com/contest/${c.id}`
          }
        });
      }
    }
    
    console.log('Polled Codeforces contests successfully.');
  } catch (error) {
    console.error('Error polling Codeforces contests:', error);
  }
}

export async function pollCodeforcesUserSubmissions(userId: string, handle: string) {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.status?handle=${handle}&from=1&count=50`);
    if (response.data.status !== 'OK') {
      throw new Error('Codeforces API returned non-OK status');
    }

    const submissions = response.data.result;
    
    for (const sub of submissions) {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
      const problemName = sub.problem.name;
      const verdict = sub.verdict; // 'OK', 'WRONG_ANSWER', etc.
      const submittedAt = new Date(sub.creationTimeSeconds * 1000);
      const language = sub.programmingLanguage;

      await prisma.submission.upsert({
        where: {
          userId_platform_problemId_submittedAt: {
            userId,
            platform: 'codeforces',
            problemId,
            submittedAt,
          }
        },
        update: {
          verdict,
        },
        create: {
          userId,
          platform: 'codeforces',
          problemId,
          problemName,
          verdict,
          language,
          submittedAt,
        }
      });
    }

    console.log(`Polled Codeforces submissions for handle: ${handle}`);
  } catch (error) {
    console.error(`Error polling CF submissions for ${handle}:`, error);
  }
}
