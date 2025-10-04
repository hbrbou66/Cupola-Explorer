import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring } from 'framer-motion';
import type { Lesson } from '../data/lessons.ts';
import { lessonData } from '../data/lessons.ts';
import LessonModal from '../components/education/LessonModal';
import type { QuizCompletionPayload } from '../components/education/QuizModule';
import { getQuizByLessonId } from '../data/quizzes.ts';
import { useEducationProgress } from '../hooks/useEducationProgress.ts';

const useAnimatedNumber = (value: number) => {
  const spring = useSpring(value, { stiffness: 160, damping: 26, mass: 0.6 });
  const [animatedValue, setAnimatedValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setAnimatedValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  return animatedValue;
};

const ACHIEVEMENT_DEFINITIONS: Record<string, { title: string; description: string }> = {
  'first-docking': {
    title: 'First Docking',
    description: 'Complete your first lesson quiz with a passing score.',
  },
  'halfway-crew': {
    title: 'Halfway Crew',
    description: 'Certify at least half of the available lessons.',
  },
  'mission-master': {
    title: 'Mission Master',
    description: 'Complete every lesson in the education hangar.',
  },
  'perfect-flight': {
    title: 'Perfect Flight',
    description: 'Earn a flawless 100% score on any lesson quiz.',
  },
  'precision-specialist': {
    title: 'Precision Specialist',
    description: 'Score 90% or higher on any lesson quiz.',
  },
  'challenge-completed': {
    title: 'Challenge Completed',
    description: 'Finish an ISS Knowledge Challenge run.',
  },
  'gold-ace': {
    title: 'Gold Ace',
    description: 'Achieve a Gold rank in the ISS Knowledge Challenge.',
  },
};

const EducationPage = () => {
  const navigate = useNavigate();
  const {
    progress: educationProgress,
    lessonProgress,
    challengeHistory,
    markLessonViewed,
    recordQuizAttempt,
    derived,
  } = useEducationProgress();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);
  const [navigationDirection, setNavigationDirection] = useState(0);

  const latestChallengeRecord = useMemo(
    () => (challengeHistory.length > 0 ? challengeHistory[challengeHistory.length - 1] : null),
    [challengeHistory],
  );

  const selectedLesson: Lesson | null = useMemo(() => {
    if (selectedLessonIndex === null) {
      return null;
    }

    const lesson = lessonData[selectedLessonIndex];

    if (!lesson) {
      console.error('Selected lesson index is out of bounds', {
        selectedLessonIndex,
        lessonDataLength: lessonData.length,
      });
      return null;
    }

    return lesson;
  }, [selectedLessonIndex]);

  useEffect(() => {
    if (!selectedLesson) {
      return;
    }

    console.log('Selected lesson data for modal:', selectedLesson);
    console.log(selectedLesson);
  }, [selectedLesson]);

  const selectedQuiz = useMemo(
    () => (selectedLesson ? getQuizByLessonId(selectedLesson.id) ?? null : null),
    [selectedLesson],
  );

  const handleLessonClose = () => {
    setSelectedLessonIndex(null);
  };

  useEffect(() => {
    if (!selectedLesson) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleLessonClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLesson]);

  const handleBackToExplorer = () => {
    navigate('/');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    const index = lessonData.findIndex((item) => item.id === lesson.id);
    if (index === -1) {
      console.error('Attempted to select a lesson that does not exist in lessonData', {
        requestedLessonId: lesson.id,
      });
      return;
    }
    setNavigationDirection(0);
    setSelectedLessonIndex(index);
    markLessonViewed(lesson.id);
  };

  const handleLessonNavigate = (direction: 'next' | 'previous') => {
    if (selectedLessonIndex === null) {
      return;
    }

    const delta = direction === 'next' ? 1 : -1;
    setNavigationDirection(delta);

    const newIndex = (selectedLessonIndex + delta + lessonData.length) % lessonData.length;
    const lesson = lessonData[newIndex];
    if (!lesson) {
      console.error('Failed to find lesson data while navigating', {
        newIndex,
        selectedLessonIndex,
        delta,
        lessonDataLength: lessonData.length,
      });
      return;
    }
    setSelectedLessonIndex(newIndex);
    markLessonViewed(lesson.id);
  };

  const handleQuizComplete = ({ lessonId, percentage, passed }: QuizCompletionPayload) => {
    recordQuizAttempt({ lessonId, percentage, passed });
  };

  const { totalLessons, completedCount, totalAttempts, bestMissionScore } = derived;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const animatedProgress = useAnimatedNumber(progress);
  const animatedCompleted = useAnimatedNumber(completedCount);
  const animatedAttempts = useAnimatedNumber(totalAttempts);
  const animatedBestScore = useAnimatedNumber(bestMissionScore);
  const animatedTotalScore = useAnimatedNumber(educationProgress.totalScore ?? 0);

  const unlockedAchievements = educationProgress.achievements ?? [];
  const allAchievementEntries = Object.entries(ACHIEVEMENT_DEFINITIONS);
  const hasUnlockedAchievements = unlockedAchievements.length > 0;
  const requiredLessonsForChallenge = 3;
  const missionStatusMessage = useMemo(() => {
    if (completedCount === 0) {
      return 'Launch your first training quiz to start logging mission certifications.';
    }
    if (completedCount === totalLessons) {
      return 'All lessons certified! You have mastered the Cupola Explorer curriculum.';
    }
    return `Progress ${completedCount} of ${totalLessons} missions. Keep training to certify the rest.`;
  }, [completedCount, totalLessons]);
  const formattedBestScore = bestMissionScore > 0 ? `${Math.round(animatedBestScore)}%` : '—';
  const formattedTotalScore = Math.round(animatedTotalScore);
  const isChallengeUnlocked = completedCount >= requiredLessonsForChallenge;
  const lessonsRemaining = Math.max(requiredLessonsForChallenge - completedCount, 0);
  const challengeSubtitle = isChallengeUnlocked
    ? 'Ready for the ISS Knowledge Challenge'
    : 'Complete 3 lessons to unlock the challenge';

  return (
    <div className="education-page flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-sky-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex min-w-0 flex-col text-left">
            <h1 className="text-base font-semibold uppercase tracking-[0.4em] text-sky-100 sm:text-lg">Cupola Explorer</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.55em] text-sky-400">Learning Mission Control</p>
          </div>
          <button
            type="button"
            onClick={handleBackToExplorer}
            className="rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-sky-100 transition hover:-translate-y-0.5 hover:border-sky-400/70 hover:bg-sky-500/20 hover:shadow-[0_15px_45px_-30px_rgba(56,189,248,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            ⬅ Back to Explorer
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
        <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-slate-900/70 p-8 shadow-[0_45px_120px_-60px_rgba(56,189,248,0.9)]">
          <div
            className="pointer-events-none absolute -left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-sky-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/80">Education Mission</p>
              <h2 className="mt-3 text-3xl font-semibold text-sky-100 sm:text-4xl">Interactive ISS Learning Lab</h2>
              <p className="mt-4 text-base text-slate-300">
                Track your progress as you explore the International Space Station&apos;s most awe-inspiring facts.
                Each module flows directly into Explorer for a hands-on experience.
              </p>
            </div>
              <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-[0_20px_60px_-45px_rgba(56,189,248,0.75)]">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span className="font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Mission Progress</span>
                <span className="font-semibold text-sky-100">{Math.round(animatedCompleted)}/{totalLessons}</span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-800/80"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(animatedProgress)}
              >
                <motion.div
                  className="h-full w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.max(progress, 0) / 100 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Ace the mission quiz with an 80% score to mark each lesson as complete.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          {lessonData.map((lesson) => {
            const progressEntry = lessonProgress[lesson.id];
            const isComplete = progressEntry?.completed ?? false;
            const hasAttempt = (progressEntry?.attempts ?? 0) > 0;
            const bestScore = Math.round(progressEntry?.bestScore ?? 0);
            return (
              <motion.article
                key={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => handleLessonSelect(lesson)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleLessonSelect(lesson);
                  }
                }}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 via-slate-950/70 to-slate-900/80 p-8 shadow-[0_35px_90px_-55px_rgba(59,130,246,0.85)] transition-colors duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                whileHover={{ y: -10, scale: 1.02, rotateX: 1.5, rotateY: -1.5 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rotate-12 rounded-full bg-cyan-500/20 blur-3xl" />
                  <div className="absolute -left-32 bottom-0 h-48 w-48 rounded-full bg-sky-400/10 blur-2xl" />
                </div>
                <div className="relative flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Lesson {lesson.id.toString().padStart(2, '0')}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-sky-100 transition-colors duration-500 group-hover:text-cyan-100">
                        {lesson.title}
                      </h3>
                    </div>
                    {isComplete ? (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-emerald-200">
                        Complete
                      </span>
                    ) : hasAttempt ? (
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-amber-200">
                        Best {bestScore}%
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{lesson.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
                    Tap to expand lesson
                    <span aria-hidden="true" className="text-base text-cyan-200/70 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLessonSelect(lesson);
                      }}
                      className="rounded-xl border border-cyan-400/60 bg-cyan-500/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-45px_rgba(6,182,212,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        <motion.section
          className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950/80 p-8 shadow-[0_55px_160px_-80px_rgba(99,102,241,0.65)]"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div
            className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 text-center lg:grid-cols-[1.35fr_1fr] lg:items-center lg:text-left">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-indigo-300/80">Special Mission</p>
                <h3 className="mt-3 text-3xl font-semibold text-sky-100 sm:text-4xl">ISS Knowledge Challenge</h3>
                <p className="mt-3 text-sm text-slate-300">{challengeSubtitle}</p>
              </div>
              <ul className="grid gap-3 text-sm text-slate-300/90 sm:grid-cols-2 lg:grid-cols-1">
                <li className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-left">
                  <p className="text-[11px] uppercase tracking-[0.45em] text-indigo-200/80">Mission Format</p>
                  <p className="mt-2 text-sm text-slate-200">10 rapid-fire questions mixing intel from every lesson.</p>
                </li>
                <li className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-left">
                  <p className="text-[11px] uppercase tracking-[0.45em] text-sky-200/80">Rewards</p>
                  <p className="mt-2 text-sm text-slate-200">Earn Bronze, Silver, or Gold ranks and log your top accuracy.</p>
                </li>
              </ul>
              {latestChallengeRecord && (
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/80">
                  Last Rank: {latestChallengeRecord.rank} — {Math.round(latestChallengeRecord.accuracy)}% accuracy
                </p>
              )}
            </div>
            <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-indigo-400/30 bg-slate-950/70 p-6 shadow-[0_30px_90px_-70px_rgba(129,140,248,0.95)]">
              <div className="flex w-full items-center justify-between text-[11px] uppercase tracking-[0.4em]">
                <span className="text-indigo-200/80">Status</span>
                <span className={isChallengeUnlocked ? 'text-emerald-200' : 'text-amber-200'}>
                  {isChallengeUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-left">
                <p className="text-[11px] uppercase tracking-[0.35em] text-indigo-200/80">Mission Checklist</p>
                <p className="text-xs text-slate-300">
                  {isChallengeUnlocked
                    ? 'All pre-mission lessons cleared. You are cleared for launch!'
                    : `Complete ${lessonsRemaining} more lesson${lessonsRemaining === 1 ? '' : 's'} to begin the challenge.`}
                </p>
              </div>
              {isChallengeUnlocked ? (
                <motion.button
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/challenge')}
                  className="mt-2 w-full rounded-2xl border border-indigo-400/60 bg-gradient-to-r from-indigo-500/70 via-sky-500/60 to-cyan-400/70 px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-indigo-50 shadow-[0_25px_70px_-50px_rgba(129,140,248,0.9)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                >
                  Start Challenge
                </motion.button>
              ) : (
                <div className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-900/70 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Training in progress
                </div>
              )}
              <p className="text-center text-[11px] text-slate-400">
                Launch directly into the challenge once unlocked — no extra briefing required.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-10 text-center shadow-[0_55px_160px_-80px_rgba(56,189,248,1)]">
          <div
            className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/70">Mission Debrief</p>
            <h3 className="text-2xl font-semibold text-sky-100 sm:text-3xl">Training Log &amp; Achievements</h3>
            <p className="text-sm text-slate-300">{missionStatusMessage}</p>
            <div className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Lessons Cleared</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">
                  {Math.round(animatedCompleted)}/{totalLessons}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-400/25 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Quiz Attempts</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">{Math.round(animatedAttempts)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Best Score</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">{formattedBestScore}</p>
              </div>
              <div className="rounded-2xl border border-indigo-400/25 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Challenge Score</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">
                  {formattedTotalScore > 0 ? formattedTotalScore : '—'}
                </p>
              </div>
            </div>

            <div className="mt-6 text-left">
              <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Achievements</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {allAchievementEntries.map(([id, info]) => {
                  const unlocked = unlockedAchievements.includes(id);
                  return (
                    <div
                      key={id}
                      className={`relative overflow-hidden rounded-2xl border p-4 transition ${
                        unlocked
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100 shadow-[0_25px_80px_-60px_rgba(16,185,129,0.85)]'
                          : 'border-slate-800/60 bg-slate-900/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.3em]">
                          {info.title}
                        </h4>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                            unlocked ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800/70 text-slate-400'
                          }`}
                        >
                          {unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-200/90">{info.description}</p>
                    </div>
                  );
                })}
              </div>
              {!hasUnlockedAchievements && (
                <p className="mt-3 text-xs text-slate-400">
                  Complete lessons and challenges to earn new mission achievements.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <LessonModal
        isOpen={Boolean(selectedLesson)}
        lesson={selectedLesson}
        lessonIndex={selectedLessonIndex ?? 0}
        totalLessons={totalLessons}
        navigationDirection={navigationDirection}
        quiz={selectedQuiz}
        onClose={handleLessonClose}
        onNavigate={handleLessonNavigate}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};

export default EducationPage;
