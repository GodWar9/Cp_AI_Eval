import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LeaderboardService {
  /**
   * Recompute CQI (Code Quality Index) for all users.
   * Typically called by a background cron job every hour.
   */
  async recomputeAllCQI() {
    console.log('Recomputing CQI for all users...');
    
    const users = await prisma.user.findMany({
      include: {
        submissions: true,
        contestParticipations: true,
      }
    });

    for (const user of users) {
      const score = this.calculateCQI(user.submissions, user.contestParticipations);
      
      await prisma.cqiScore.create({
        data: {
          userId: user.id,
          score: score.total,
          breakdown: {
            consistency: score.consistency,
            volume: score.volume,
            contestRating: score.contestRating,
          }
        }
      });
    }

    console.log('CQI recomputation complete.');
  }

  /**
   * Basic mock logic for CQI computation.
   * Real formula will weight by problem difficulty, time decay, and contest rank.
   */
  private calculateCQI(submissions: any[], participations: any[]) {
    // 1. Volume (Number of Accepted submissions)
    const acSubmissions = submissions.filter(s => 
      s.verdict === 'OK' || s.verdict === 'Accepted' || s.verdict === 'AC'
    );
    const volumeScore = acSubmissions.length * 10;

    // 2. Consistency (Submissions in recent days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSubs = acSubmissions.filter(s => new Date(s.submittedAt).getTime() > thirtyDaysAgo);
    const consistencyScore = recentSubs.length * 5;

    // 3. Contest Rating (derived from highest rating change or average)
    let contestRatingScore = 0;
    if (participations.length > 0) {
      const positiveChanges = participations.filter(p => p.ratingChange && p.ratingChange > 0);
      contestRatingScore = positiveChanges.reduce((sum, p) => sum + (p.ratingChange || 0), 0) * 2;
    }

    const total = volumeScore + consistencyScore + contestRatingScore;

    return {
      total,
      volume: volumeScore,
      consistency: consistencyScore,
      contestRating: contestRatingScore
    };
  }
}

export const leaderboardService = new LeaderboardService();
