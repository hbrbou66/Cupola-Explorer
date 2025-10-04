export const LESSON_PROGRESS_STORAGE_KEY = 'cupola-education-progress';
export const CHALLENGE_RANK_STORAGE_KEY = 'cupola-challenge-rank';

export interface ChallengeRankRecord {
  rank: 'Bronze' | 'Silver' | 'Gold';
  percentage: number;
  completedAt: string;
}
