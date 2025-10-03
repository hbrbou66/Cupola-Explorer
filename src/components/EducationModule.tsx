import { useEffect, useMemo, useState } from 'react';
import { EARTH_RADIUS_KM } from '../utils/iss.ts';

type LessonKey = 'speed' | 'sunsets';

interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface EducationModuleProps {
  issSpeed: number;
  onFastTimeline: (speedMultiplier?: number) => void;
  onCloseMenu: () => void;
}

const ALTITUDE_ESTIMATE_KM = 420;

const quizQuestions: QuizQuestion[] = [
  {
    prompt: 'How long does the ISS need to circle Earth once?',
    options: ['45 minutes', 'About 90 minutes', '3 hours'],
    answer: 1,
    explanation:
      'At roughly 27,600 km/h it completes a 2πr lap (Earth + 420 km altitude) in about an hour and a half.',
  },
  {
    prompt: 'Roughly how many sunrises and sunsets do astronauts see each day?',
    options: ['1 of each — same as Earth', '8 of each', '16 of each'],
    answer: 2,
    explanation: 'With ~90 minute orbits the station circles Earth nearly 16 times every 24 hours.',
  },
];

const lessonCards: Array<{
  id: LessonKey;
  title: string;
  summary: string;
}> = [
  {
    id: 'speed',
    title: 'How fast is the ISS?',
    summary: 'Track the station\'s blistering orbital speed and orbit time.',
  },
  {
    id: 'sunsets',
    title: 'Why 16 Sunsets per Day?',
    summary: 'Play the orbital timeline to see back-to-back day/night transitions.',
  },
];

const formatNumber = (value: number, fractionDigits: number) =>
  Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits }) : '—';

const EducationModule = ({ issSpeed, onFastTimeline, onCloseMenu }: EducationModuleProps) => {
  const [activeLesson, setActiveLesson] = useState<LessonKey | null>(null);
  const [speedUnits, setSpeedUnits] = useState<'kmh' | 'mph' | 'kms'>('kmh');
  const [quizIndex, setQuizIndex] = useState(0);
  const [selection, setSelection] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timelineStatus, setTimelineStatus] = useState<string | null>(null);
  const [demoSpeed, setDemoSpeed] = useState(200);

  useEffect(() => {
    let timeout: number | undefined;
    if (timelineStatus) {
      timeout = window.setTimeout(() => {
        setTimelineStatus(null);
      }, 6000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timelineStatus]);

  const orbitMinutes = useMemo(() => {
    if (!Number.isFinite(issSpeed) || issSpeed <= 0) {
      return 90;
    }
    const orbitalCircumference = 2 * Math.PI * (EARTH_RADIUS_KM + ALTITUDE_ESTIMATE_KM);
    return (orbitalCircumference / issSpeed) * 60;
  }, [issSpeed]);

  const orbitsPerDay = useMemo(() => 24 * 60 / orbitMinutes, [orbitMinutes]);

  const speedDisplay = useMemo(() => {
    const conversions = {
      kmh: { label: 'km/h', value: issSpeed },
      mph: { label: 'mph', value: issSpeed * 0.621371 },
      kms: { label: 'km/s', value: issSpeed / 3600 },
    } as const;
    const active = conversions[speedUnits];
    return `${formatNumber(active.value, speedUnits === 'kms' ? 2 : 0)} ${active.label}`;
  }, [issSpeed, speedUnits]);

  const handleQuizSubmit = () => {
    if (selection == null) {
      setFeedback('Choose an option to check your answer.');
      return;
    }
    const current = quizQuestions[quizIndex];
    const isCorrect = selection === current.answer;
    setFeedback(isCorrect ? '✅ Correct! Great observation.' : `❌ Not quite. ${current.explanation}`);
  };

  const goToNextQuestion = () => {
    setQuizIndex((index) => (index + 1) % quizQuestions.length);
    setSelection(null);
    setFeedback(null);
  };

  const triggerTimelineDemo = (speed: number) => {
    setDemoSpeed(speed);
    setTimelineStatus(`Timeline accelerated to ${speed}× for a day/night sprint.`);
    onFastTimeline(speed);
  };

  const renderLessonList = () => (
    <div className="grid gap-3 text-left">
      {lessonCards.map((lesson) => (
        <button
          key={lesson.id}
          type="button"
          onClick={() => setActiveLesson(lesson.id)}
          className="group rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 hover:border-sky-400/60 hover:bg-slate-900/80"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-slate-400">Lesson</p>
              <h3 className="mt-1 text-base font-semibold text-sky-100">{lesson.title}</h3>
            </div>
            <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-200 transition group-hover:border-sky-300/60 group-hover:bg-sky-500/20">
              Explore →
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">{lesson.summary}</p>
        </button>
      ))}
    </div>
  );

  const renderLessonHeader = (title: string) => (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-sky-100">{title}</h3>
      <button
        type="button"
        onClick={() => setActiveLesson(null)}
        className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-sky-400/70 hover:text-sky-200"
      >
        Back
      </button>
    </div>
  );

  const renderSpeedLesson = () => (
    <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
      {renderLessonHeader('How fast is the ISS?')}
      <p className="text-sm text-slate-300">
        The International Space Station streaks around Earth fast enough to lap the planet roughly every hour and a
        half. Compare units to feel just how incredible that speed is.
      </p>
      <div className="grid gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Live speed</p>
        <p className="text-2xl font-semibold text-sky-100">{speedDisplay}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { key: 'kmh', label: 'km/h' },
            { key: 'mph', label: 'mph' },
            { key: 'kms', label: 'km/s' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSpeedUnits(key as typeof speedUnits)}
              className={`rounded-lg border px-3 py-1 font-semibold transition ${
                speedUnits === key
                  ? 'border-sky-400/80 bg-sky-500/20 text-sky-100'
                  : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 text-sm text-slate-300">
        <p>
          Orbit time estimate: <span className="font-semibold text-sky-100">{formatNumber(orbitMinutes, 1)} minutes</span> per lap.
        </p>
        <p>
          That means about <span className="font-semibold text-sky-100">{formatNumber(orbitsPerDay, 1)} orbits</span> each Earth day — nearly a
          full sunset and sunrise every 45 minutes!
        </p>
      </div>
    </div>
  );

  const renderSunsetLesson = () => (
    <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
      {renderLessonHeader('Why 16 Sunsets per Day?')}
      <p className="text-sm text-slate-300">
        Because the station circles Earth every ~90 minutes, crew members keep zipping from daylight to darkness. Use
        the fast timeline demo to watch the horizon flash between blues and golds.
      </p>
      <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 text-sm text-slate-300">
        <p className="font-semibold text-sky-100">Timeline demo</p>
        <p className="mt-2">
          Select a playback boost and launch the demo. It temporarily cranks the simulator so you can spot back-to-back
          sunrises and auroras on the globe.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[60, 200].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => triggerTimelineDemo(speed)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                demoSpeed === speed
                  ? 'border-amber-400/80 bg-amber-500/20 text-amber-100'
                  : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-amber-400/60'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            triggerTimelineDemo(demoSpeed);
            setActiveLesson(null);
            onCloseMenu();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/70 bg-amber-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100 transition hover:border-amber-300/70"
        >
          ▶ Fast timeline demo
        </button>
        {timelineStatus && <p className="mt-3 text-xs text-amber-200">{timelineStatus}</p>}
      </div>
      <div className="grid gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 p-4 text-sm text-slate-300">
        <p>
          Every orbit brings the station back into sunlight, so astronauts log roughly{' '}
          <span className="font-semibold text-sky-100">{formatNumber(orbitsPerDay, 0)} day/night cycles</span> daily.
        </p>
        <p>
          Their body clocks rely on scheduled lighting and activities more than the actual view outside the window!
        </p>
      </div>
    </div>
  );

  const currentQuestion = quizQuestions[quizIndex];
  const quizProgress = ((quizIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="flex flex-col gap-5 text-sm text-slate-200">
      <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Education Module</h2>
      {!activeLesson && renderLessonList()}
      {activeLesson === 'speed' && renderSpeedLesson()}
      {activeLesson === 'sunsets' && renderSunsetLesson()}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Quiz Station</h3>
          <span className="text-xs text-slate-400">{quizIndex + 1} / {quizQuestions.length}</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-sky-400" style={{ width: `${quizProgress}%` }} />
        </div>
        <p className="mt-4 text-base font-semibold text-sky-100">{currentQuestion.prompt}</p>
        <form className="mt-3 space-y-2">
          {currentQuestion.options.map((option, index) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                selection === index
                  ? 'border-sky-400/80 bg-sky-500/15'
                  : 'border-slate-700/60 bg-slate-950/50 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name={`quiz-${quizIndex}`}
                value={index}
                checked={selection === index}
                onChange={() => setSelection(index)}
                className="h-4 w-4 accent-sky-400"
              />
              <span>{option}</span>
            </label>
          ))}
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleQuizSubmit}
            className="rounded-lg border border-sky-400/70 bg-sky-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:border-sky-300/80"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={goToNextQuestion}
            className="rounded-lg border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-sky-300/60 hover:text-sky-200"
          >
            Next
          </button>
          {feedback && <p className="text-xs text-sky-200">{feedback}</p>}
        </div>
      </div>
    </div>
  );
};

export default EducationModule;
