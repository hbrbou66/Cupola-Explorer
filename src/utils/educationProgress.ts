import { LESSON_PROGRESS_STORAGE_KEY } from './storageKeys.ts';

export interface EducationProgress {
  lessons: LessonProgress[];
  quizzes: QuizProgress[];
  totalXP: number;
  achievements: string[];
  lastUpdated: string;
}

export interface EducationRank {
  id: string;
  title: string;
  minXP: number;
  description: string;
}

export interface RankProgressSnapshot {
  current: EducationRank;
  next: EducationRank | null;
  progress: number;
  xpIntoCurrent: number;
  xpForCurrent: number;
  xpRemaining: number;
}

export interface LessonProgress {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface QuizProgress {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

const DEFAULT_PROGRESS: EducationProgress = {
  lessons: [],
  quizzes: [],
  totalXP: 0,
  achievements: [],
  lastUpdated: new Date(0).toISOString(),
};

export const EDUCATION_RANKS: EducationRank[] = [
  {
    id: 'cadet',
    title: 'Orbital Cadet',
    minXP: 0,
    description: 'Freshly assigned to Cupola duty and beginning ISS systems training.',
  },
  {
    id: 'specialist',
    title: 'Systems Specialist',
    minXP: 150,
    description: 'Certified on key Cupola procedures with solid knowledge check scores.',
  },
  {
    id: 'pilot',
    title: 'Station Pilot',
    minXP: 350,
    description: 'Trusted with guiding orbital operations thanks to consistent high accuracy.',
  },
  {
    id: 'commander',
    title: 'Mission Commander',
    minXP: 600,
    description: 'Leads Cupola observations with expert-level mastery of training modules.',
  },
  {
    id: 'legend',
    title: 'Explorer Legend',
    minXP: 900,
    description: 'An elite Cupola observer whose telemetry knowledge is unmatched.',
  },
];

const normalizeLesson = (lesson: LessonProgress): LessonProgress => ({
  id: lesson.id,
  title: lesson.title,
  completed: Boolean(lesson.completed),
  completedAt: lesson.completedAt,
});

const normalizeQuiz = (quiz: QuizProgress): QuizProgress => ({
  id: quiz.id,
  title: quiz.title,
  score: Number.isFinite(quiz.score) ? Number(quiz.score) : 0,
  maxScore: Number.isFinite(quiz.maxScore) ? Number(quiz.maxScore) : 0,
  completedAt: quiz.completedAt,
});

const readStoredProgress = (): EducationProgress => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(LESSON_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(raw) as Partial<EducationProgress> | null;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_PROGRESS;
    }

    const lessons = Array.isArray(parsed.lessons)
      ? parsed.lessons.map(normalizeLesson)
      : DEFAULT_PROGRESS.lessons;
    const quizzes = Array.isArray(parsed.quizzes)
      ? parsed.quizzes.map(normalizeQuiz)
      : DEFAULT_PROGRESS.quizzes;
    const totalXP = Number.isFinite(parsed.totalXP) ? Number(parsed.totalXP) : DEFAULT_PROGRESS.totalXP;
    const achievements = Array.isArray(parsed.achievements)
      ? (parsed.achievements as string[])
      : DEFAULT_PROGRESS.achievements;
    const lastUpdated = typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : new Date(0).toISOString();

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      lessons,
      quizzes,
      totalXP,
      achievements,
      lastUpdated,
    };
  } catch (error) {
    console.warn('Failed to read stored education progress', error);
    return DEFAULT_PROGRESS;
  }
};

const normalizeDate = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }
  return new Date(timestamp).toISOString();
};

export const getEducationProgress = (): EducationProgress => {
  return readStoredProgress();
};

const mergeLessonProgress = (current: LessonProgress[], incoming: LessonProgress[]): LessonProgress[] => {
  const map = new Map<string, LessonProgress>();
  current.forEach((lesson) => {
    map.set(lesson.id, normalizeLesson(lesson));
  });

  incoming.forEach((lesson) => {
    const normalized = normalizeLesson(lesson);
    const existing = map.get(normalized.id);
    const completed = normalized.completed ?? existing?.completed ?? false;
    const completedAt = completed
      ? normalizeDate(normalized.completedAt) ?? existing?.completedAt ?? new Date().toISOString()
      : existing?.completedAt;

    map.set(normalized.id, {
      ...(existing ?? normalized),
      ...normalized,
      completed,
      completedAt,
    });
  });

  return Array.from(map.values());
};

const mergeQuizProgress = (current: QuizProgress[], incoming: QuizProgress[]): QuizProgress[] => {
  const map = new Map<string, QuizProgress>();
  current.forEach((quiz) => {
    map.set(quiz.id, normalizeQuiz(quiz));
  });

  incoming.forEach((quiz) => {
    const normalized = normalizeQuiz(quiz);
    const existing = map.get(normalized.id);
    if (!existing) {
      map.set(normalized.id, normalized);
      return;
    }

    const existingRatio = existing.maxScore > 0 ? existing.score / existing.maxScore : existing.score;
    const normalizedRatio = normalized.maxScore > 0 ? normalized.score / normalized.maxScore : normalized.score;

    if (normalizedRatio >= existingRatio) {
      map.set(normalized.id, {
        ...existing,
        ...normalized,
        completedAt: normalizeDate(normalized.completedAt) ?? new Date().toISOString(),
      });
    } else {
      map.set(normalized.id, {
        ...existing,
        completedAt: normalizeDate(normalized.completedAt) ?? existing.completedAt,
      });
    }
  });

  return Array.from(map.values());
};

export const mergeUnique = <T>(base: T[] = [], incoming: T[] = []): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];

  [...base, ...incoming].forEach((item) => {
    const key = typeof item === 'string' ? item : JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });

  return result;
};

export const quizScoreToXP = (score: number, maxScore: number): number => {
  if (maxScore <= 0) {
    return Math.max(0, Math.round(score));
  }
  const ratio = score / maxScore;
  return Math.max(0, Math.round(ratio * 100));
};

const scoreToXP = (quiz: QuizProgress): number => {
  return quizScoreToXP(quiz.score, quiz.maxScore);
};

export const calculateTotalXP = (
  update: Partial<EducationProgress>,
  current: EducationProgress,
): number => {
  if (typeof update.totalXP === 'number' && Number.isFinite(update.totalXP)) {
    return update.totalXP;
  }

  let total = current.totalXP ?? 0;

  if (update.quizzes && update.quizzes.length > 0) {
    const currentQuizzes = new Map(current.quizzes.map((quiz) => [quiz.id, quiz]));

    update.quizzes.forEach((quiz) => {
      const normalized = normalizeQuiz(quiz);
      const previous = currentQuizzes.get(normalized.id);
      const previousXP = previous ? scoreToXP(previous) : 0;
      const nextXP = scoreToXP(normalized);
      if (nextXP > previousXP) {
        total += nextXP - previousXP;
      }
    });
  }

  return total;
};

export const updateEducationProgress = (
  update: Partial<EducationProgress>,
): EducationProgress => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PROGRESS, ...update };
  }

  const current = readStoredProgress();

  const mergedLessons = update.lessons
    ? mergeLessonProgress(current.lessons, update.lessons.map(normalizeLesson))
    : current.lessons;
  const mergedQuizzes = update.quizzes
    ? mergeQuizProgress(current.quizzes, update.quizzes.map(normalizeQuiz))
    : current.quizzes;
  const mergedAchievements = update.achievements
    ? mergeUnique(current.achievements, update.achievements)
    : current.achievements;

  const next: EducationProgress = {
    ...current,
    lessons: mergedLessons,
    quizzes: mergedQuizzes,
    totalXP: calculateTotalXP({ ...update, quizzes: update.quizzes }, current),
    achievements: mergedAchievements,
    lastUpdated: update.lastUpdated ?? new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Failed to persist education progress', error);
  }

  return next;
};

export const getRankForXP = (xp: number): RankProgressSnapshot => {
  const sorted = [...EDUCATION_RANKS].sort((a, b) => a.minXP - b.minXP);
  if (sorted.length === 0) {
    const fallback: EducationRank = {
      id: 'explorer',
      title: 'Explorer',
      minXP: 0,
      description: 'Learning the systems of the International Space Station.',
    };
    return {
      current: fallback,
      next: null,
      progress: 100,
      xpIntoCurrent: xp,
      xpForCurrent: Math.max(1, xp),
      xpRemaining: 0,
    };
  }

  const current = sorted.reduce((acc, rank) => {
    if (xp >= rank.minXP) {
      return rank;
    }
    return acc;
  }, sorted[0]);

  const currentIndex = sorted.findIndex((rank) => rank.id === current.id);
  const next = sorted.slice(currentIndex + 1).find((rank) => rank.minXP > current.minXP) ?? null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      xpIntoCurrent: Math.max(0, xp - current.minXP),
      xpForCurrent: Math.max(1, Math.max(0, xp - current.minXP)),
      xpRemaining: 0,
    };
  }

  const range = Math.max(1, next.minXP - current.minXP);
  const xpIntoCurrent = Math.max(0, xp - current.minXP);
  const progress = Math.min(100, Math.max(0, (xpIntoCurrent / range) * 100));
  const xpRemaining = Math.max(0, next.minXP - xp);

  return {
    current,
    next,
    progress,
    xpIntoCurrent,
    xpForCurrent: range,
    xpRemaining,
  };
};

export default updateEducationProgress;
