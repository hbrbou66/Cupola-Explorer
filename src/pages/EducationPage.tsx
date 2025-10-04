import { useLocation, useNavigate } from 'react-router-dom';
import EducationModule from '../components/EducationModule.tsx';
import useFastTimelineDemo from '../hooks/useFastTimelineDemo.ts';
import { FALLBACK_SPEED_KMH } from '../utils/iss.ts';

type LocationState = {
  issSpeed?: number;
};

const EducationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleFastTimelineDemo = useFastTimelineDemo();
  const state = (location.state ?? {}) as LocationState;
  const issSpeed = typeof state.issSpeed === 'number' ? state.issSpeed : FALLBACK_SPEED_KMH;

  const handleBackToExplorer = () => {
    navigate('/');
  };

  return (
    <div className="education-page flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-sky-100">
      <header className="header-bar">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex min-w-0 flex-col text-left">
            <h1 className="text-lg font-semibold uppercase tracking-[0.4em] text-sky-100 sm:text-2xl">Cupola Explorer</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.55em] text-sky-400">Astronaut Edition</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToExplorer}
              className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:border-sky-400/70 hover:bg-sky-500/20"
            >
              ⬅ Back to Explorer
            </button>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-2 text-slate-200 transition hover:border-sky-400/70 hover:bg-slate-900/80 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_25px_80px_-40px_rgba(56,189,248,0.55)]">
          <EducationModule issSpeed={issSpeed} onFastTimeline={handleFastTimelineDemo} />
        </section>
      </main>
    </div>
  );
};

export default EducationPage;

