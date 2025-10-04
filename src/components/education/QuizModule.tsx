import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { Group } from 'three';
import type { QuizQuestion } from '../../data/quizzes.ts';

export interface QuizCompletionPayload {
  lessonId: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface QuizModuleProps {
  lessonId: number;
  questions: QuizQuestion[];
  onComplete: (payload: QuizCompletionPayload) => void;
}

const PASSING_PERCENTAGE = 80;

const questionVariants = {
  enter: {
    opacity: 0,
    y: 20,
  },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
} as const;

const feedbackVariants = {
  correct: {
    boxShadow: '0 0 25px rgba(34, 211, 238, 0.55)',
    transition: { duration: 0.35 },
  },
  incorrect: {
    x: [0, -10, 10, -8, 6, -3, 0],
    transition: { duration: 0.45 },
  },
};

const HologramISS = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 40 }}
      className="pointer-events-none"
      gl={{ alpha: true }}
    >
      <color attach="background" args={[0, 0, 0]} />
      <ambientLight intensity={0.4} />
      <HologramModel />
    </Canvas>
  );
};

const HologramModel = () => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = elapsed * 0.4;
    groupRef.current.position.y = 0.1 * Math.sin(elapsed * 1.5);
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0.6, 0]}>
      <mesh scale={[0.95, 0.12, 0.95]} position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.02, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.25} />
      </mesh>
      <mesh scale={[0.4, 0.2, 0.4]}>
        <boxGeometry args={[1, 0.3, 0.3]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} wireframe />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-0.7, 0, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.02]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.7, 0, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.02]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

const QuizModule = ({ lessonId, questions, onComplete }: QuizModuleProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showResults, setShowResults] = useState(false);
  const [sparkleBurst, setSparkleBurst] = useState<number | null>(null);
  const [resultSnapshot, setResultSnapshot] = useState({ score: 0, total: questions.length, percentage: 0 });

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = useMemo(() => {
    if (totalQuestions === 0) {
      return 0;
    }
    const base = (currentQuestionIndex / totalQuestions) * 100;
    const answeredBonus = selectedAnswer !== null ? 100 / totalQuestions : 0;
    return Math.min(100, base + answeredBonus);
  }, [currentQuestionIndex, totalQuestions, selectedAnswer]);

  useEffect(() => {
    if (sparkleBurst === null) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setSparkleBurst(null), 1200);
    return () => window.clearTimeout(timeout);
  }, [sparkleBurst]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFeedbackState('idle');
    setSparkleBurst(null);
    setShowResults(false);
    setResultSnapshot({ score: 0, total: questions.length, percentage: 0 });
  }, [lessonId, questions]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) {
      return;
    }
    const isCorrect = index === currentQuestion.correctIndex;
    setSelectedAnswer(index);
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore((value) => value + 1);
      setSparkleBurst(Date.now());
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === totalQuestions - 1) {
      handleQuizComplete();
      return;
    }
    setCurrentQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setFeedbackState('idle');
    setSparkleBurst(null);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFeedbackState('idle');
    setShowResults(false);
    setSparkleBurst(null);
    setResultSnapshot({ score: 0, total: questions.length, percentage: 0 });
  };

  const handleQuizComplete = () => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= PASSING_PERCENTAGE;
    setResultSnapshot({ score, total: totalQuestions, percentage });
    onComplete({
      lessonId,
      score,
      total: totalQuestions,
      percentage,
      passed,
    });
    setShowResults(true);
  };

  if (!currentQuestion) {
    return (
      <div className="rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-6 text-center text-sky-100">
        No quiz data available for this lesson yet.
      </div>
    );
  }

  const explanation = currentQuestion.explanation;
  const isCorrectSelection = selectedAnswer !== null && selectedAnswer === currentQuestion.correctIndex;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/90 p-6 sm:p-8 shadow-[0_45px_120px_-60px_rgba(14,165,233,0.6)]">
      <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-cyan-400/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Quiz Mission</p>
            <h3 className="mt-1 text-2xl font-semibold text-sky-100">Knowledge Systems Check</h3>
          </div>
          <div className="relative flex w-full max-w-xs flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-slate-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
              Score {score}/{totalQuestions}
            </p>
          </div>
        </div>

        <div className="relative min-h-[260px] rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6">
          <div className="absolute -top-2 right-4 h-32 w-32 overflow-hidden rounded-3xl border border-cyan-400/20 bg-cyan-500/5">
            <HologramISS />
            <AnimatePresence>
              {sparkleBurst !== null && (
                <motion.div
                  key={sparkleBurst}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Canvas camera={{ position: [0, 0, 1.4], fov: 45 }} gl={{ alpha: true }}>
                    <Sparkles
                      count={24}
                      speed={0.7}
                      size={6}
                      scale={[2, 2, 2]}
                      color="#fbbf24"
                    />
                  </Canvas>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pr-36">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.question}
                variants={questionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <motion.p
                  animate={
                    feedbackState === 'correct'
                      ? feedbackVariants.correct
                      : feedbackState === 'incorrect'
                        ? feedbackVariants.incorrect
                        : {}
                  }
                  className="text-lg font-semibold text-sky-100"
                >
                  {currentQuestion.question}
                </motion.p>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === currentQuestion.correctIndex;
                    const showCorrect = selectedAnswer !== null && isCorrectOption;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={selectedAnswer !== null}
                        onClick={() => handleAnswerSelect(index)}
                        className={`group flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                          selectedAnswer === null
                            ? 'border-slate-700/60 bg-slate-900/60 hover:border-cyan-400/60 hover:bg-slate-900/80'
                            : showCorrect
                              ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_25px_-10px_rgba(16,185,129,0.9)]'
                              : isSelected
                                ? 'border-rose-500/70 bg-rose-500/10 text-rose-200 shadow-[0_0_25px_-12px_rgba(244,63,94,0.9)]'
                                : 'border-slate-800/70 bg-slate-950/40 text-slate-300'
                        }`}
                      >
                        <span>{option}</span>
                        {selectedAnswer !== null && (
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            {showCorrect ? 'Correct' : isSelected ? 'Selected' : ''}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    isCorrectSelection
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
                  }`}
                >
                  <p className="font-semibold uppercase tracking-[0.35em] text-[11px]">
                    {isCorrectSelection ? 'Mission data confirmed' : 'Course correction needed'}
                  </p>
                  <p className="mt-2 text-slate-100/90">{explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:border-cyan-400/60 hover:text-sky-100"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={selectedAnswer === null}
              onClick={handleNextQuestion}
              className="rounded-xl border border-cyan-400/70 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_20px_60px_-40px_rgba(6,182,212,0.9)] disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:bg-slate-900/60 disabled:text-slate-400"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Mission' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              className="relative w-[min(420px,90%)] overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-6 text-center text-sky-100 shadow-[0_45px_120px_-60px_rgba(14,165,233,0.7)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" aria-hidden="true" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex flex-col gap-4"
              >
                <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/80">Mission Complete</p>
                <h4 className="text-3xl font-semibold text-sky-100">
                  Final Score {resultSnapshot.score}/{resultSnapshot.total}
                </h4>
                <p className="text-lg font-semibold text-cyan-200">{resultSnapshot.percentage}% accuracy</p>
                <div className="flex items-center justify-center gap-2 text-3xl">
                  {'⭐⭐⭐'}
                </div>
                <p className="text-sm text-slate-300">
                  {`You achieved a ${resultSnapshot.percentage}% systems accuracy.`}
                  {` ${resultSnapshot.percentage >= PASSING_PERCENTAGE ? 'Lesson marked as complete!' : 'Review the data and try again.'}`}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResults(false)}
                    className="rounded-xl border border-cyan-400/60 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-45px_rgba(6,182,212,0.85)]"
                  >
                    Return to Lessons
                  </button>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="rounded-xl border border-amber-400/60 bg-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-100 transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-45px_rgba(251,191,36,0.75)]"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizModule;
