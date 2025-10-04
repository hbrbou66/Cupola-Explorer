import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LessonVisual from './LessonVisual';
import LessonFacts from './LessonFacts';
import QuizModule, { type QuizCompletionPayload } from './QuizModule';
import type { Lesson } from '../../data/lessons.ts';
import type { LessonQuiz } from '../../data/quizzes.ts';

interface LessonModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  lessonIndex: number;
  totalLessons: number;
  navigationDirection: number;
  quiz: LessonQuiz | null;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'previous') => void;
  onQuizComplete: (payload: QuizCompletionPayload) => void;
}

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

const LessonModal = ({
  isOpen,
  lesson,
  lessonIndex,
  totalLessons,
  navigationDirection,
  quiz,
  onClose,
  onNavigate,
  onQuizComplete,
}: LessonModalProps) => {
  if (!lesson) {
    return null;
  }

  const hasLessonVisual = Boolean(lesson.model);

  const renderLessonContent = (isFallback = false) => (
    <div className="lesson-modal-content flex-1 overflow-y-auto max-h-[90vh] p-6">
      <div className="space-y-10 pb-6">
        {hasLessonVisual && (
          <div className="lesson-visual-section">
            {isFallback ? (
              <div className="flex h-[26rem] w-full items-center justify-center rounded-[1.75rem] border border-slate-800/60 bg-slate-950/70 text-[10px] uppercase tracking-[0.4em] text-slate-500/70">
                Loading visual…
              </div>
            ) : (
              <LessonVisual lesson={lesson} />
            )}
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-sky-100 sm:text-3xl">{lesson.title}</h2>
          <p className="text-base leading-relaxed text-slate-300">{lesson.description}</p>
          <LessonFacts facts={lesson.facts} />
        </section>

        <section className="prose prose-invert max-w-none leading-relaxed text-slate-200/90">
          {lesson.details.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </section>

        <section>
          <div className="w-full rounded-2xl border border-amber-600/40 bg-amber-900/20 p-4 text-amber-100">
            <div className="mb-1 text-xs uppercase tracking-widest opacity-80">Did you know?</div>
            <p>{lesson.funFact}</p>
          </div>
        </section>

        {quiz ? (
          isFallback ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 text-center text-sm uppercase tracking-[0.3em] text-slate-400">
              Preparing quiz…
            </div>
          ) : (
            <QuizModule
              key={lesson.id}
              lessonId={lesson.id}
              questions={quiz.questions}
              onComplete={onQuizComplete}
            />
          )
        ) : null}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdropVariants}
        >
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            role="presentation"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-lesson-title"
            variants={modalVariants}
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 flex max-h-[92vh] w-[min(1100px,95vw)] flex-col overflow-hidden rounded-3xl border border-sky-800/60 bg-slate-950/85 shadow-2xl backdrop-blur-xl"
          >
            <div className="sticky top-0 z-10 border-b border-sky-800/50 bg-slate-950/90 px-6 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-sky-400/80">
                    Lesson {lesson.id.toString().padStart(2, '0')}
                  </p>
                  <h2 id="selected-lesson-title" className="text-xl font-semibold text-sky-100 sm:text-2xl">
                    {lesson.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-sky-700/60 px-3 py-2 text-sky-200/90 transition hover:bg-sky-900/40"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <Suspense fallback={renderLessonContent(true)}>
              <AnimatePresence mode="wait" custom={navigationDirection}>
                <motion.div
                  key={`${lesson.id}-content`}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={navigationDirection}
                  className="flex-1"
                >
                  {renderLessonContent(false)}
                </motion.div>
              </AnimatePresence>
            </Suspense>

            <div className="sticky bottom-0 z-10 border-t border-sky-800/50 bg-slate-950/90 px-6 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.35em] text-sky-300/80">
                  Lesson {lessonIndex + 1} of {totalLessons}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('previous')}
                    className="rounded-lg border border-sky-700/60 px-3 py-2 text-sky-200/90 transition hover:bg-sky-900/40"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('next')}
                    className="rounded-lg border border-sky-700/60 px-3 py-2 text-sky-200/90 transition hover:bg-sky-900/40"
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
  );
};

export default LessonModal;
