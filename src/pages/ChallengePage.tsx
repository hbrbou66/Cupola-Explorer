import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import QuizModule, { type QuizCompletionPayload } from '../components/education/QuizModule';
import { quizzes, type QuizQuestion } from '../data/quizzes.ts';
import { useEducationProgress, type ChallengeRankRecord } from '../hooks/useEducationProgress.ts';
import { updateEducationProgress } from '../utils/educationProgress.ts';

const CHALLENGE_LENGTH = 10;

type ChallengePhase = 'intro' | 'quiz';

type ChallengeRank = ChallengeRankRecord['rank'];

interface ChallengeResult extends QuizCompletionPayload {
  rank: ChallengeRank;
}

const computeRank = (percentage: number): ChallengeRank => {
  if (percentage >= 90) {
    return 'Gold';
  }
  if (percentage >= 70) {
    return 'Silver';
  }
  return 'Bronze';
};

const getAllQuestions = () => quizzes.flatMap((quiz) => quiz.questions);

const createQuestionSet = (): QuizQuestion[] => {
  const allQuestions = getAllQuestions();
  const shuffled = [...allQuestions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(CHALLENGE_LENGTH, shuffled.length));
};

const ChallengePage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ChallengePhase>('intro');
  const [sessionId, setSessionId] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const { challengeHistory, recordChallengeResult } = useEducationProgress();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const latestRecord = challengeHistory.length > 0 ? challengeHistory[challengeHistory.length - 1] : null;

  const cinematicGlow = useMemo(
    () => ({
      backgroundImage:
        'radial-gradient(circle at top, rgba(129,140,248,0.2), transparent 55%), radial-gradient(circle at bottom, rgba(236,72,153,0.12), transparent 60%)',
    }),
    [],
  );

  const handleBack = () => {
    if (phase === 'quiz') {
      setPhase('intro');
      setQuestions([]);
      setShowSuccess(false);
      setSessionStartTime(null);
      return;
    }
    navigate('/education');
  };

  const startChallengeSession = () => {
    const nextQuestions = createQuestionSet();
    setQuestions(nextQuestions);
    setSessionId((value) => value + 1);
    setPhase('quiz');
    setShowSuccess(false);
    setResult(null);
    setSessionStartTime(Date.now());
  };

  const handleChallengeComplete = (payload: QuizCompletionPayload) => {
    const rank = computeRank(payload.percentage);
    const timeTaken = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
    const record: ChallengeRankRecord = {
      timestamp: new Date().toISOString(),
      score: payload.score,
      rank,
      accuracy: payload.percentage,
      timeTaken,
    };
    recordChallengeResult(record);
    const achievements = ['challenge-completed'];
    if (rank === 'Gold') {
      achievements.push('challenge-gold');
    }
    updateEducationProgress({
      quizzes: [
        {
          id: 'quiz-iss-challenge',
          title: 'ISS Knowledge Challenge',
          score: payload.score,
          maxScore: payload.total,
          completedAt: record.timestamp,
        },
      ],
      achievements,
    });
    setResult({ ...payload, rank });
    setShowSuccess(true);
    setSessionStartTime(null);
  };

  const handleReturnToEducation = () => {
    setShowSuccess(false);
    navigate('/education');
  };

  const handleRetry = () => {
    setShowSuccess(false);
    startChallengeSession();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-sky-100">
      <div className="pointer-events-none absolute inset-0 opacity-80" style={cinematicGlow} aria-hidden="true" />
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex min-w-0 flex-col text-left">
            <h1 className="text-base font-semibold uppercase tracking-[0.4em] text-sky-100 sm:text-lg">Cupola Explorer</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.55em] text-indigo-300">Knowledge Challenge</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-2xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-100 transition hover:-translate-y-0.5 hover:border-indigo-300/70 hover:bg-indigo-500/20 hover:shadow-[0_15px_45px_-30px_rgba(129,140,248,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            ⬅ Back
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.section
              key="challenge-intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[2.5rem] border border-indigo-400/30 bg-slate-950/80 p-10 shadow-[0_65px_180px_-90px_rgba(99,102,241,0.8)]"
            >
              <div
                className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-8 text-center">
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.6em] text-indigo-300/80">Cinematic Briefing</p>
                  <h2 className="text-4xl font-semibold text-sky-100 sm:text-5xl">ISS Knowledge Challenge</h2>
                  <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
                    Strap in for a rapid-fire orbital simulation. This ten-question gauntlet pulls the sharpest intel from every
                    training module. Maintain focus, lock in your answers, and earn an elite mission rank.
                  </p>
                  {latestRecord && (
                    <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/80">
                      Last Rank: {latestRecord.rank} — {Math.round(latestRecord.accuracy)}% accuracy
                    </p>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={startChallengeSession}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.96 }}
                  className="mx-auto w-full max-w-xs rounded-3xl border border-indigo-400/60 bg-indigo-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.45em] text-indigo-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                >
                  Begin Challenge
                </motion.button>
              </div>
            </motion.section>
          )}

          {phase === 'quiz' && (
            <motion.section
              key="challenge-quiz"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <QuizModule
                key={sessionId}
                lessonId={0}
                lessonTitle="ISS Knowledge Challenge"
                questions={questions}
                onComplete={handleChallengeComplete}
                showCompletionModal={false}
                persistProgress={false}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSuccess && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              className="relative w-[min(480px,92vw)] overflow-hidden rounded-[2.5rem] border border-indigo-400/40 bg-slate-950/85 p-8 text-center text-sky-100 shadow-[0_55px_160px_-80px_rgba(129,140,248,0.9)]"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_65%)]"
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-5">
                <p className="text-xs uppercase tracking-[0.6em] text-indigo-200/90">Challenge Complete</p>
                <h3 className="text-4xl font-semibold text-sky-100">{result.rank} Rank</h3>
                <p className="text-lg text-indigo-100">{result.percentage}% accuracy</p>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <p>
                    You answered {result.score} out of {result.total} questions correctly.
                  </p>
                  <p>
                    Bronze &lt;70% · Silver &lt;90% · Gold ≥90%
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReturnToEducation}
                    className="rounded-2xl border border-indigo-400/60 bg-indigo-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-indigo-100"
                  >
                    Return to Education
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRetry}
                    className="rounded-2xl border border-fuchsia-400/60 bg-fuchsia-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-fuchsia-100"
                  >
                    Challenge Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengePage;
