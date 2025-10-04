export const LESSON_PROGRESS_STORAGE_KEY = 'cupola-education-progress';
export const CHALLENGE_HISTORY_STORAGE_KEY = 'cupola-challenge-history';

export interface ChallengeRankRecord {
  timestamp: string;
  score: number;
  rank: string;
  accuracy: number;
  timeTaken: number;
}
