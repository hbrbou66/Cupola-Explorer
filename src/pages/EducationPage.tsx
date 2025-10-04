import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Lesson } from '../data/lessons.ts';
import { lessonData } from '../data/lessons.ts';
import LessonVisual from '../components/education/LessonVisual';
import QuizModule, { type QuizCompletionPayload } from '../components/education/QuizModule';
import { getQuizByLessonId } from '../data/quizzes.ts';

interface LessonProgressEntry {
  viewed: boolean;
  bestScore: number;
  attempts: number;
  completed: boolean;
  lastScore?: number;
}

const EducationPage = () => {
  const navigate = useNavigate();
  const [lessonProgress, setLessonProgress] = useState<Record<number, LessonProgressEntry>>({});
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);
  const [navigationDirection, setNavigationDirection] = useState(0);

  const selectedLesson: Lesson | null = useMemo(
    () => (selectedLessonIndex !== null ? lessonData[selectedLessonIndex] : null),
    [selectedLessonIndex],
  );

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
      return;
    }
    setNavigationDirection(0);
    setSelectedLessonIndex(index);
    setLessonProgress((prev) => {
      const existing = prev[lesson.id];
      return {
        ...prev,
        [lesson.id]: {
          viewed: true,
          bestScore: existing?.bestScore ?? 0,
          attempts: existing?.attempts ?? 0,
          completed: existing?.completed ?? false,
          lastScore: existing?.lastScore,
        },
      };
    });
  };

  const handleLessonNavigate = (direction: 'next' | 'previous') => {
    if (selectedLessonIndex === null) {
      return;
    }

    const delta = direction === 'next' ? 1 : -1;
    setNavigationDirection(delta);

    const newIndex = (selectedLessonIndex + delta + lessonData.length) % lessonData.length;
    const lesson = lessonData[newIndex];
    setSelectedLessonIndex(newIndex);
    setLessonProgress((prev) => {
      const existing = prev[lesson.id];
      return {
        ...prev,
        [lesson.id]: {
          viewed: true,
          bestScore: existing?.bestScore ?? 0,
          attempts: existing?.attempts ?? 0,
          completed: existing?.completed ?? false,
          lastScore: existing?.lastScore,
        },
      };
    });
  };

  const handleQuizComplete = ({ lessonId, percentage, passed }: QuizCompletionPayload) => {
    setLessonProgress((prev) => {
      const existing = prev[lessonId];
      const bestScore = Math.max(existing?.bestScore ?? 0, percentage);
      return {
        ...prev,
        [lessonId]: {
          viewed: existing?.viewed ?? true,
          bestScore,
          attempts: (existing?.attempts ?? 0) + 1,
          completed: passed || existing?.completed || false,
          lastScore: percentage,
        },
      };
    });
  };

  const totalLessons = lessonData.length;
  const completedCount = useMemo(
    () =>
      lessonData.reduce(
        (total, lesson) => (lessonProgress[lesson.id]?.completed ? total + 1 : total),
        0,
      ),
    [lessonProgress],
  );
  const totalAttempts = useMemo(
    () =>
      Object.values(lessonProgress).reduce((total, entry) => total + (entry.attempts ?? 0), 0),
    [lessonProgress],
  );
  const bestMissionScore = useMemo(
    () =>
      Object.values(lessonProgress).reduce((best, entry) =>
        entry.bestScore > best ? entry.bestScore : best,
      0),
    [lessonProgress],
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const missionStatusMessage = useMemo(() => {
    if (completedCount === 0) {
      return 'Launch your first training quiz to start logging mission certifications.';
    }
    if (completedCount === totalLessons) {
      return 'All lessons certified! You have mastered the Cupola Explorer curriculum.';
    }
    return `Progress ${completedCount} of ${totalLessons} missions. Keep training to certify the rest.`;
  }, [completedCount, totalLessons]);
  const formattedBestScore = bestMissionScore > 0 ? `${Math.round(bestMissionScore)}%` : '—';

  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  };

  const contentVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : direction < 0 ? -60 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : direction < 0 ? 60 : 0,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
    }),
  } as const;

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
                <span className="font-semibold text-sky-100">{completedCount}/{totalLessons}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/80" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div
                  className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 transition-transform duration-700 ease-out"
                  style={{ transform: `scaleX(${progress / 100})` }}
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

        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-10 text-center shadow-[0_55px_160px_-80px_rgba(56,189,248,1)]">
          <div
            className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/70">Mission Debrief</p>
            <h3 className="text-2xl font-semibold text-sky-100 sm:text-3xl">Training Log &amp; Achievements</h3>
            <p className="text-sm text-slate-300">{missionStatusMessage}</p>
            <div className="grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Lessons Cleared</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">
                  {completedCount}/{totalLessons}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-400/25 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Quiz Attempts</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">{totalAttempts}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/70">Best Score</p>
                <p className="mt-3 text-2xl font-semibold text-sky-100">{formattedBestScore}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalBackdropVariants}
          >
            <motion.div
              role="presentation"
              onClick={handleLessonClose}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full cursor-pointer bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="selected-lesson-title"
              variants={modalVariants}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto w-[min(1100px,95vw)] h-[85vh] sm:h-[85vh] xs:h-[92vh] rounded-3xl border border-sky-800/60 bg-slate-950/80 shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col overflow-hidden"
            >
              <div className="shrink-0 sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-sky-800/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-sky-400/80 uppercase">
                      Lesson {selectedLesson.id.toString().padStart(2, '0')}
                    </p>
                    <h2 id="selected-lesson-title" className="text-xl sm:text-2xl font-semibold text-sky-100">
                      {selectedLesson.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleLessonClose}
                    className="rounded-full border border-sky-700/60 px-3 py-2 hover:bg-sky-900/40"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait" custom={navigationDirection}>
                <motion.div
                  key={`${selectedLesson.id}-content`}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={navigationDirection}
                  className="grow overflow-y-auto overscroll-contain scroll-smooth px-6 py-6 space-y-10 modal-scroll lesson-scrollable-content"
                >
                  <section className="lesson-section">
                    <LessonVisual lesson={selectedLesson} />
                  </section>

                  <section className="lesson-section grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="prose prose-invert max-w-none leading-relaxed text-slate-200/90">
                      {selectedLesson.details.split('\n\n').map((paragraph) => (
                        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-sky-800/50 bg-slate-900/40 p-4">
                      <h3 className="text-sky-300/90 text-sm tracking-widest uppercase mb-3">Key Facts</h3>
                      <ul className="grid gap-3 md:grid-cols-1">
                        {selectedLesson.facts.map((fact) => (
                          <li key={fact} className="fact-item border border-sky-700/40 text-sky-100/90">
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section className="lesson-section">
                    <div className="w-full rounded-2xl border border-amber-600/40 bg-amber-900/20 p-4 text-amber-100">
                      <div className="uppercase text-xs tracking-widest opacity-80 mb-1">Did you know?</div>
                      <p>{selectedLesson.funFact ?? 'Even at ~400 km, thin atmosphere causes drag; reboosts keep ISS aloft.'}</p>
                    </div>
                  </section>

                  {selectedQuiz && (
                    <section className="lesson-section">
                      <QuizModule
                        key={selectedLesson.id}
                        lessonId={selectedLesson.id}
                        questions={selectedQuiz.questions}
                        onComplete={handleQuizComplete}
                      />
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="shrink-0 sticky bottom-0 z-10 bg-slate-950/90 backdrop-blur border-t border-sky-800/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] tracking-widest text-sky-300/80">
                    Lesson {(selectedLessonIndex ?? 0) + 1} of {totalLessons}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLessonNavigate('previous')}
                      className="rounded-lg border border-sky-700/60 px-3 py-2 hover:bg-sky-900/40"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLessonNavigate('next')}
                      className="rounded-lg border border-sky-700/60 px-3 py-2 hover:bg-sky-900/40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default EducationPage;

