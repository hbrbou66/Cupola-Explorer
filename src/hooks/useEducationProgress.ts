import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { lessonData } from '../data/lessons.ts';
import {
  CHALLENGE_HISTORY_STORAGE_KEY,
  LESSON_PROGRESS_STORAGE_KEY,
  type ChallengeRankRecord,
} from '../utils/storageKeys.ts';
import type {
  EducationProgress as TrackerProgress,
  LessonProgress as TrackerLessonProgress,
  QuizProgress as TrackerQuizProgress,
} from '../utils/educationProgress.ts';

export interface LessonProgressEntry {
  viewed: boolean;
  bestScore: number;
  attempts: number;
  completed: boolean;
  lastScore?: number;
}

export interface EducationProgress {
  completedLessons: string[];
  totalLessons: number;
  totalScore: number;
  achievements: string[];
  lastUpdated: string;
  lessonStats: Record<number, LessonProgressEntry>;
  challengeHistory: ChallengeRankRecord[];
  lessons?: TrackerLessonProgress[];
  quizzes?: TrackerQuizProgress[];
  totalXP?: number;
}

const LEGACY_CHALLENGE_KEY = 'cupola-challenge-rank';
const LEGACY_LESSON_PROGRESS_KEY = 'lesson-progress';

const DEFAULT_PROGRESS: EducationProgress = {
  completedLessons: [],
  totalLessons: lessonData.length,
  totalScore: 0,
  achievements: [],
  lastUpdated: new Date(0).toISOString(),
  lessonStats: {},
  challengeHistory: [],
  lessons: [],
  quizzes: [],
  totalXP: 0,
};

const toLessonKey = (lessonId: number) => `lesson-${lessonId.toString().padStart(2, '0')}`;

const computeAchievements = (
  lessonStats: Record<number, LessonProgressEntry>,
  challengeHistory: ChallengeRankRecord[],
) => {
  const achievements = new Set<string>();
  const entries = Object.values(lessonStats);
  const completedLessons = entries.filter((entry) => entry.completed).length;
  const perfectLesson = entries.some((entry) => Math.round(entry.bestScore) >= 100);
  const highLesson = entries.some((entry) => Math.round(entry.bestScore) >= 90);

  if (completedLessons > 0) {
    achievements.add('first-docking');
  }
  if (completedLessons >= Math.max(1, Math.floor(lessonData.length / 2))) {
    achievements.add('halfway-crew');
  }
  if (completedLessons === lessonData.length && lessonData.length > 0) {
    achievements.add('mission-master');
  }
  if (perfectLesson) {
    achievements.add('perfect-flight');
  } else if (highLesson) {
    achievements.add('precision-specialist');
  }
  if (challengeHistory.length > 0) {
    achievements.add('challenge-completed');
  }
  if (challengeHistory.some((record) => record.rank === 'Gold')) {
    achievements.add('gold-ace');
  }

  return Array.from(achievements);
};

const parseLessonProgressEntries = (value: unknown) => {
  const lessonStats: Record<number, LessonProgressEntry> = {};
  if (!value || typeof value !== 'object') {
    return lessonStats;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    const lessonId = Number(key);
    if (!Number.isNaN(lessonId) && entry && typeof entry === 'object') {
      const { viewed, bestScore, attempts, completed, lastScore } = entry as LessonProgressEntry;
      lessonStats[lessonId] = {
        viewed: Boolean(viewed),
        bestScore: Number.isFinite(bestScore) ? Number(bestScore) : 0,
        attempts: Number.isFinite(attempts) ? Number(attempts) : 0,
        completed: Boolean(completed),
        lastScore: Number.isFinite(lastScore) ? Number(lastScore) : undefined,
      };
    }
  });

  return lessonStats;
};

const migrateStoredProgress = (raw: string | null): EducationProgress => {
  if (!raw) {
    return DEFAULT_PROGRESS;
  }

  try {
    const parsed = JSON.parse(raw) as
      | (Partial<EducationProgress> & Partial<TrackerProgress>)
      | Record<string, LessonProgressEntry>
      | null;
    if (!parsed) {
      return DEFAULT_PROGRESS;
    }

    if (
      'lessonStats' in parsed ||
      'completedLessons' in parsed ||
      'achievements' in parsed ||
      'lessons' in parsed ||
      'quizzes' in parsed
    ) {
      const candidate = parsed as Partial<EducationProgress> & Partial<TrackerProgress>;
      const lessonStats = candidate.lessonStats ? { ...candidate.lessonStats } : {};
      const challengeHistory = Array.isArray(candidate.challengeHistory)
        ? [...candidate.challengeHistory]
        : [];
      const lessons = Array.isArray(candidate.lessons) ? [...candidate.lessons] : [];
      const quizzes = Array.isArray(candidate.quizzes) ? [...candidate.quizzes] : [];
      const totalXP = Number.isFinite(candidate.totalXP) ? Number(candidate.totalXP) : 0;

      return {
        ...DEFAULT_PROGRESS,
        ...candidate,
        lessonStats,
        challengeHistory,
        lessons,
        quizzes,
        totalXP,
      };
    }

    const legacyLessonStats = parseLessonProgressEntries(parsed);
    return {
      ...DEFAULT_PROGRESS,
      lessonStats: legacyLessonStats,
    };
  } catch (error) {
    console.warn('Failed to parse stored education progress', error);
    return DEFAULT_PROGRESS;
  }
};

const mergeLegacyChallengeHistory = (
  progress: EducationProgress,
  storage: Storage,
): EducationProgress => {
  let merged = progress;
  try {
    const challengeRaw = storage.getItem(CHALLENGE_HISTORY_STORAGE_KEY);
    if (challengeRaw) {
      const parsed = JSON.parse(challengeRaw);
      if (Array.isArray(parsed)) {
        merged = {
          ...merged,
          challengeHistory: parsed as ChallengeRankRecord[],
        };
      }
      storage.removeItem(CHALLENGE_HISTORY_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to parse legacy challenge history', error);
  }

  try {
    const legacyRank = storage.getItem(LEGACY_CHALLENGE_KEY);
    if (legacyRank) {
      const parsedLegacy = JSON.parse(legacyRank) as {
        rank?: string;
        percentage?: number;
        completedAt?: string;
      } | null;
      if (parsedLegacy && typeof parsedLegacy === 'object') {
        const historyRecord: ChallengeRankRecord = {
          timestamp: parsedLegacy.completedAt ?? new Date().toISOString(),
          score: 0,
          rank: parsedLegacy.rank ?? 'Bronze',
          accuracy: parsedLegacy.percentage ?? 0,
          timeTaken: 0,
        };
        merged = {
          ...merged,
          challengeHistory: [...merged.challengeHistory, historyRecord],
        };
      }
      storage.removeItem(LEGACY_CHALLENGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to parse legacy challenge rank', error);
  }

  return merged;
};

const mergeLegacyLessonProgress = (progress: EducationProgress, storage: Storage) => {
  try {
    const legacyLessonRaw = storage.getItem(LEGACY_LESSON_PROGRESS_KEY);
    if (!legacyLessonRaw) {
      return progress;
    }
    const parsed = JSON.parse(legacyLessonRaw);
    const legacyLessonStats = parseLessonProgressEntries(parsed);
    const mergedLessonStats = { ...legacyLessonStats, ...progress.lessonStats };
    storage.removeItem(LEGACY_LESSON_PROGRESS_KEY);
    return {
      ...progress,
      lessonStats: mergedLessonStats,
    };
  } catch (error) {
    console.warn('Failed to parse legacy lesson progress', error);
    return progress;
  }
};

const deriveProgress = (base: EducationProgress): EducationProgress => {
  const lessonStats = base.lessonStats ?? {};
  const challengeHistory = base.challengeHistory ?? [];
  const completedLessons = new Set<string>(base.completedLessons ?? []);
  const lessons = Array.isArray(base.lessons) ? base.lessons : [];
  const quizzes = Array.isArray(base.quizzes) ? base.quizzes : [];
  const totalXP = Number.isFinite(base.totalXP) ? Number(base.totalXP) : 0;

  Object.entries(lessonStats).forEach(([lessonKey, entry]) => {
    const lessonId = Number(lessonKey);
    const key = toLessonKey(lessonId);
    if (entry?.completed) {
      completedLessons.add(key);
    } else {
      completedLessons.delete(key);
    }
  });

  const totalScore = challengeHistory.reduce((total, record) => total + (record?.score ?? 0), 0);
  const achievements = computeAchievements(lessonStats, challengeHistory);

  return {
    ...DEFAULT_PROGRESS,
    ...base,
    lessonStats,
    challengeHistory,
    completedLessons: Array.from(completedLessons),
    totalLessons: lessonData.length,
    totalScore,
    achievements,
    lastUpdated: new Date().toISOString(),
    lessons,
    quizzes,
    totalXP,
  };
};

const loadInitialProgress = (): EducationProgress => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }
  const storage = window.localStorage;
  const storedRaw = storage.getItem(LESSON_PROGRESS_STORAGE_KEY);
  let progress = migrateStoredProgress(storedRaw);
  progress = mergeLegacyLessonProgress(progress, storage);
  progress = mergeLegacyChallengeHistory(progress, storage);
  const derived = deriveProgress(progress);
  try {
    storage.setItem(LESSON_PROGRESS_STORAGE_KEY, JSON.stringify(derived));
  } catch (error) {
    console.warn('Failed to persist derived education progress', error);
  }
  return derived;
};

const useIsMounted = () => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};

export const useEducationProgress = () => {
  const [progress, setProgress] = useState<EducationProgress>(() => loadInitialProgress());
  const isMounted = useIsMounted();

  const persistProgress = useCallback((next: EducationProgress) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to persist education progress', error);
    }
  }, []);

  const updateProgress = useCallback((updater: (current: EducationProgress) => EducationProgress) => {
    setProgress((current) => {
      const next = deriveProgress(updater(current));
      persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  const markLessonViewed = useCallback(
    (lessonId: number) => {
      updateProgress((current) => {
        const existing = current.lessonStats[lessonId] ?? {
          viewed: false,
          bestScore: 0,
          attempts: 0,
          completed: false,
        };
        return {
          ...current,
          lessonStats: {
            ...current.lessonStats,
            [lessonId]: {
              ...existing,
              viewed: true,
            },
          },
        };
      });
    },
    [updateProgress],
  );

  const recordQuizAttempt = useCallback(
    ({ lessonId, percentage, passed }: { lessonId: number; percentage: number; passed: boolean }) => {
      updateProgress((current) => {
        const existing = current.lessonStats[lessonId] ?? {
          viewed: true,
          bestScore: 0,
          attempts: 0,
          completed: false,
        };
        const bestScore = Math.max(existing.bestScore ?? 0, percentage);
        return {
          ...current,
          lessonStats: {
            ...current.lessonStats,
            [lessonId]: {
              ...existing,
              viewed: true,
              attempts: (existing.attempts ?? 0) + 1,
              bestScore,
              completed: passed || existing.completed,
              lastScore: percentage,
            },
          },
        };
      });
    },
    [updateProgress],
  );

  const recordChallengeResult = useCallback(
    (record: ChallengeRankRecord) => {
      updateProgress((current) => ({
        ...current,
        challengeHistory: [...current.challengeHistory, record],
      }));
    },
    [updateProgress],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (!isMounted.current) {
        return;
      }
      if (event.key === LESSON_PROGRESS_STORAGE_KEY) {
        const next = event.newValue
          ? deriveProgress(migrateStoredProgress(event.newValue))
          : DEFAULT_PROGRESS;
        setProgress(next);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [isMounted]);

  const derived = useMemo(() => {
    const lessonStats = progress.lessonStats ?? {};
    const totalLessons = lessonData.length;
    const completedLessons = progress.completedLessons ?? [];
    const completedCount = completedLessons.length;
    const totalAttempts = Object.values(lessonStats).reduce(
      (total, entry) => total + (entry?.attempts ?? 0),
      0,
    );
    const bestMissionScore = Object.values(lessonStats).reduce(
      (best, entry) => (entry?.bestScore ?? 0) > best ? entry.bestScore : best,
      0,
    );

    return {
      totalLessons,
      completedCount,
      totalAttempts,
      bestMissionScore,
    };
  }, [progress]);

  return {
    progress,
    lessonProgress: progress.lessonStats,
    challengeHistory: progress.challengeHistory,
    markLessonViewed,
    recordQuizAttempt,
    recordChallengeResult,
    derived,
  };
};

export type { ChallengeRankRecord };
