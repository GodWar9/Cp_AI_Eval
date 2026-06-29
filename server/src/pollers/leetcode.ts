import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

export async function pollLeetcodeContests() {
  const query = `
    query getContestList {
      topTwoContests {
        title
        titleSlug
        startTime
        duration
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API_URL, { query });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const contests = response.data.data.topTwoContests;
    
    for (const c of contests) {
      const startTime = new Date(c.startTime * 1000);
      const endTime = new Date((c.startTime + c.duration) * 1000);
      
      const now = new Date();
      const status = now < startTime ? 'upcoming' : now > endTime ? 'ended' : 'live';

      await prisma.contest.upsert({
        where: {
          platform_externalId: {
            platform: 'leetcode',
            externalId: c.titleSlug,
          }
        },
        update: {
          status,
          name: c.title,
          startTime,
          endTime,
        },
        create: {
          platform: 'leetcode',
          externalId: c.titleSlug,
          name: c.title,
          status,
          startTime,
          endTime,
          url: `https://leetcode.com/contest/${c.titleSlug}`
        }
      });
    }
    
    console.log('Polled LeetCode contests successfully.');
  } catch (error) {
    console.error('Error polling LeetCode contests:', error);
  }
}

export async function pollLeetcodeUserSubmissions(userId: string, handle: string) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  const variables = { username: handle, limit: 15 };

  try {
    const response = await axios.post(LEETCODE_API_URL, { query, variables });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const submissions = response.data.data.recentAcSubmissionList;
    
    for (const sub of submissions) {
      if (!sub) continue;
      
      const problemId = sub.titleSlug;
      const problemName = sub.title;
      const verdict = sub.statusDisplay || 'Accepted'; // API only returns ACs in this query, but we assume AC.
      const submittedAt = new Date(parseInt(sub.timestamp, 10) * 1000);
      const language = sub.lang;

      await prisma.submission.upsert({
        where: {
          userId_platform_problemId_submittedAt: {
            userId,
            platform: 'leetcode',
            problemId,
            submittedAt,
          }
        },
        update: {},
        create: {
          userId,
          platform: 'leetcode',
          problemId,
          problemName,
          verdict,
          language,
          submittedAt,
        }
      });
    }

    console.log(`Polled LeetCode submissions for handle: ${handle}`);
  } catch (error) {
    console.error(`Error polling LeetCode submissions for ${handle}:`, error);
  }
}
