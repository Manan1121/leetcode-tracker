/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SM-2 Algorithm Implementation
 * Based on SuperMemo 2 algorithm for spaced repetition
 */

export interface ReviewResult {
  difficulty: number; // 1-5 (1=forgot, 5=perfect)
  timeSpent?: number;
}

export interface SpacedRepetitionResult {
  interval: number; // Days until next review
  easeFactor: GLfloat; // Difficulty multiplier (1.3 - 2.5)
  nextReviewDate: Date;
}

export class SpacedRepetition {
  /**
   * Calculate next review date based on SM-2 algorithm
   * @param reviewCount - Number of times reviewed
   * @param easeFactor - Current ease factor (default 2.5)
   * @param lastInterval - Last interval in days
   * @param difficulty - User's rating (1-5)
   */
  static calculate(
    reviewCount: number,
    easeFactor: number = 2.5,
    lastInterval: number = 1,
    difficulty: number
  ): SpacedRepetitionResult {
    // Convert 1-5 scale to SM-2 quality (0-5)
    // 1 (forgot) = 0, 2 (hard) = 2, 3 (medium) = 3, 4 (easy) = 4, 5 (perfect) = 5
    const quality = difficulty - 1;

    // Calculate new ease factor
    let newEaseFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor is 1.3

    // Calculate interval
    let interval: number;

    if (reviewCount === 0) {
      // First review
      interval = 1;
    } else if (reviewCount === 1) {
      // Second review
      interval = 6;
    } else if (quality < 3) {
      // If difficulty is 1-3 (forgot or hard), reset interval
      interval = 1;
    } else {
      // Calculate next interval
      interval = Math.round(lastInterval * newEaseFactor);
    }

    // Adjust interval based on performance
    if (difficulty === 5) {
      // Perfect recall - increase interval more
      interval = Math.round(interval * 1.3);
    } else if (difficulty === 1) {
      // Forgot - review again soon
      interval = 1;
    }

    // Cap maximum interval at 365 days
    interval = Math.min(interval, 365);

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      interval,
      easeFactor: newEaseFactor,
      nextReviewDate,
    };
  }

  /**
   * Get problems due for review
   */
  static isDue(nextReviewDate: Date | null): boolean {
    if (!nextReviewDate) return false;
    return new Date() >= nextReviewDate;
  }

  /**
   * Get review statistics
   */
  static getReviewStats(reviews: any[]) {
    const total = reviews.length;
    const avgDifficulty =
      reviews.reduce((sum, r) => sum + r.difficulty, 0) / total || 0;
    const successRate =
      reviews.filter((r) => r.difficulty >= 3).length / total || 0;

    return {
      totalReviews: total,
      averageDifficulty: avgDifficulty.toFixed(1),
      successRate: (successRate * 100).toFixed(0),
      streak: this.calculateStreak(reviews),
    };
  }

  private static calculateStreak(reviews: any[]): number {
    let streak = 0;
    const sortedReviews = reviews.sort(
      (a, b) =>
        new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    );

    for (const review of sortedReviews) {
      if (review.difficulty >= 3) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
