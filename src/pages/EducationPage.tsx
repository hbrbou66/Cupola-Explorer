import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lesson } from '../data/lessons.ts';
import { lessonData } from '../data/lessons.ts';

const EducationPage = () => {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleLessonClose = () => {
    setModalVisible(false);
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

  useEffect(() => {
    if (!selectedLesson) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => setModalVisible(true));
    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [selectedLesson]);

  useEffect(() => {
    if (isModalVisible || !selectedLesson) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSelectedLesson(null);
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isModalVisible, selectedLesson]);

  const handleBackToExplorer = () => {
    navigate('/');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCompletedLessons((prev) => {
      if (prev.has(lesson.id)) {
        return prev;
      }
      const updated = new Set(prev);
      updated.add(lesson.id);
      return updated;
    });
  };

  const totalLessons = lessonData.length;
  const completedCount = completedLessons.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
              <p className="text-xs text-slate-400">Complete lessons by opening each mission briefing.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          {lessonData.map((lesson) => {
            const isComplete = completedLessons.has(lesson.id);
            return (
              <article
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
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 via-slate-950/70 to-slate-900/80 p-8 shadow-[0_35px_90px_-55px_rgba(59,130,246,0.85)] transition-transform duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_45px_140px_-70px_rgba(56,189,248,1)]"
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
                    {isComplete && (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-emerald-200">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{lesson.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
                    Tap to expand lesson
                    <span aria-hidden="true" className="text-base text-cyan-200/70 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-10 text-center shadow-[0_55px_160px_-80px_rgba(56,189,248,1)]">
          <div
            className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/70">Quiz Station</p>
            <h3 className="text-2xl font-semibold text-sky-100 sm:text-3xl">📘 Upcoming Quiz: Test your knowledge!</h3>
            <p className="text-sm text-slate-300">
              A luminous quiz experience is on final approach. Check back soon to challenge your ISS knowledge and
              earn mission badges.
            </p>
          </div>
        </section>
      </main>

      {selectedLesson && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <div
            role="presentation"
            onClick={handleLessonClose}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full cursor-pointer bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-lesson-title"
            className={`relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/95 p-10 shadow-[0_55px_160px_-80px_rgba(56,189,248,1)] transition-all duration-300 ease-out ${isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleLessonClose}
              className="absolute right-6 top-6 rounded-full border border-slate-700/80 bg-slate-900/80 p-2 text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Lesson {selectedLesson.id.toString().padStart(2, '0')}</p>
                <h3 id="selected-lesson-title" className="mt-4 text-3xl font-semibold text-sky-100">
                  {selectedLesson.title}
                </h3>
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                <div className="flex-1 space-y-5 text-sm leading-7 text-slate-300">
                  {selectedLesson.details.split('\n\n').map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                <div className="flex h-40 w-full max-w-xs flex-none items-center justify-center rounded-2xl border border-slate-800/70 bg-gradient-to-br from-sky-900/40 via-slate-900/30 to-slate-950/60 text-xs uppercase tracking-[0.35em] text-slate-400">
                  Illustration incoming
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationPage;

