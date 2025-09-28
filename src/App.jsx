import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ISSGlobe from './components/ISSGlobe.jsx';
import TimeControls from './components/TimeControls.jsx';
import {
  FALLBACK_TLE,
  buildFutureTrack,
  buildGroundTrack,
  createSatrec,
  fetchLatestTle,
  getScenePositionAt,
} from './utils/iss.ts';
import { useTimeStore } from './state/timeStore.tsx';

const WEIGHTLESS_DEFAULT = 0.4;
const TOOLTIP_STORAGE_KEY = 'cupola-tooltips-dismissed';
const REDUCED_MOTION_KEY = 'cupola-reduced-motion';

const formatCoordinate = (value, type) => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(2)}° ${direction}`;
};

const formatAltitude = (value) => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(1)} km`;
};

const usePersistentState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored != null) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Unable to read storage', error);
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Unable to persist storage', error);
      }
    }
  }, [key, value]);

  return [value, setValue];
};

function App() {
  const {
    currentTime,
    mode,
    speed,
    seekTo,
    stepBy,
    togglePlay,
  } = useTimeStore();

  const [satrec, setSatrec] = useState(null);
  const [tleTimestamp, setTleTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [issPosition, setIssPosition] = useState(null);
  const [trailPoints, setTrailPoints] = useState([]);
  const [futurePoints, setFuturePoints] = useState([]);
  const [viewMode, setViewMode] = useState('map');
  const [weightlessnessEnabled, setWeightlessnessEnabled] = useState(false);
  const [weightlessnessIntensity, setWeightlessnessIntensity] = useState(WEIGHTLESS_DEFAULT);
  const [showTerminator, setShowTerminator] = useState(true);
  const [showClouds, setShowClouds] = useState(true);
  const [showAurora, setShowAurora] = useState(false);
  const [showCityLights, setShowCityLights] = useState(true);
  const [reducedMotion, setReducedMotion] = usePersistentState(REDUCED_MOTION_KEY, () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [tooltipDismissed, setTooltipDismissed] = usePersistentState(TOOLTIP_STORAGE_KEY, false);
  const [isInteracting, setIsInteracting] = useState(false);

  const liveBadge = mode === 'live' ? 'Live orbit' : 'Simulated playback';

  const allowWeightlessHud = weightlessnessEnabled && !reducedMotion && !isInteracting;

  const tooltipVisible = !tooltipDismissed;
  const tooltipContent =
    'Tip: Switch to Cupola View for an astronaut-eye perspective. Drag to pan in Map View.';

  const handleDismissTooltip = () => setTooltipDismissed(true);

  useEffect(() => {
    let cancelled = false;
    const loadTle = async () => {
      try {
        const tle = await fetchLatestTle();
        if (cancelled) return;
        setSatrec(createSatrec(tle));
        setTleTimestamp(Date.now());
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Unable to retrieve updated orbital elements. Falling back to last known state.');
          setSatrec((current) => current ?? createSatrec(FALLBACK_TLE));
        }
      }
    };

    loadTle();
    const interval = setInterval(loadTle, 60 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!satrec) {
      return;
    }
    const position = getScenePositionAt(satrec, currentTime);
    if (position) {
      setIssPosition(position);
    }
  }, [satrec, currentTime]);

  const lastTrackUpdateRef = useRef(0);

  useEffect(() => {
    if (!satrec) return;
    const now = currentTime;
    const elapsed = Math.abs(now - lastTrackUpdateRef.current);
    const fastPlayback = mode === 'simulated' && speed >= 60;
    if (elapsed < (fastPlayback ? 1200 : 400)) {
      return;
    }
    lastTrackUpdateRef.current = now;

    const stepSeconds = speed >= 600 ? 90 : speed >= 60 ? 45 : 15;
    const trail = buildGroundTrack(satrec, now, 360, stepSeconds);
    const future = fastPlayback ? [] : buildFutureTrack(satrec, now, 30, 30);
    setTrailPoints(trail);
    setFuturePoints(future);
  }, [satrec, currentTime, speed, mode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) {
          return;
        }
      }
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepBy(event.shiftKey ? 5 * 60 * 1000 : 10 * 1000);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepBy(event.shiftKey ? -5 * 60 * 1000 : -10 * 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepBy, togglePlay]);

  useEffect(() => {
    if (reducedMotion) {
      setWeightlessnessEnabled(false);
    }
  }, [reducedMotion]);

  const telemetry = useMemo(() => ({
    latitude: formatCoordinate(issPosition?.latitude, 'lat'),
    longitude: formatCoordinate(issPosition?.longitude, 'lon'),
    altitude: formatAltitude(issPosition?.altitude),
    tleAge: tleTimestamp ? new Date(tleTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
  }), [issPosition, tleTimestamp]);

  const onSeek = useCallback(
    (timestamp) => {
      seekTo(Number(timestamp));
    },
    [seekTo]
  );

  const onInteractionChange = useCallback((value) => {
    setIsInteracting(value);
  }, []);

  const statusMessage = error
    ? error
    : mode === 'live'
      ? 'Tracking nominal. Streaming live orbit data.'
      : 'Simulated playback active. Speed controls adjust orbit progression.';

  const uiClassName = `flex min-h-screen flex-col bg-slate-950 text-slate-100`;

  return (
    <div className={uiClassName}>
      <header className="border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <h1 className="text-xl font-semibold uppercase tracking-[0.25em] text-sky-300 sm:text-2xl">
            Cupola Explorer – Astronaut Edition
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700/60 px-3 py-1 uppercase tracking-[0.3em] text-slate-300">
              {liveBadge}
            </span>
            <span>Orbital data via CelesTrak • Time synced in-app</span>
          </div>
        </div>
      </header>

      <main className={`relative flex flex-1 flex-col items-center px-4 py-6 sm:px-6 lg:px-8 ${
        allowWeightlessHud ? 'weightless-hud' : ''
      }`}>
        <section className="flex w-full max-w-6xl flex-1 flex-col gap-6 lg:flex-row">
          <div className="flex-1 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/60 p-3 shadow-[0_35px_120px_-50px_rgba(56,189,248,0.45)]">
            <ISSGlobe
              viewMode={viewMode}
              onViewInteraction={onInteractionChange}
              issPosition={issPosition}
              trailPoints={trailPoints}
              futurePoints={futurePoints}
              showTerminator={showTerminator}
              showCityLights={showCityLights}
              showClouds={showClouds}
              showAurora={showAurora}
              weightlessnessEnabled={weightlessnessEnabled}
              weightlessnessIntensity={weightlessnessIntensity}
              reducedMotion={reducedMotion}
              currentTime={currentTime}
              playbackSpeed={speed}
              mode={mode}
              interactionPaused={isInteracting}
            />
          </div>

          <aside className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6">
            <div
              className={`rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4 transition ${
                allowWeightlessHud ? 'weightless-float' : ''
              }`}
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">View Mode</h2>
              <div className="mt-4 flex gap-3" role="group" aria-label="View mode">
                {[
                  { value: 'map', label: 'Orbital Map' },
                  { value: 'cupola', label: 'Cupola View' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setViewMode(value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      viewMode === value
                        ? 'border-sky-400/70 bg-sky-500/20 text-sky-100'
                        : 'border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                    }`}
                    aria-pressed={viewMode === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[0.75rem] text-slate-400">
                Orbital Map enables full globe control. Cupola View locks the camera to the ISS with gentle sway for an
                astronaut perspective.
              </p>
            </div>

            <div
              className={`rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4 transition ${
                allowWeightlessHud ? 'weightless-float delay-150' : ''
              }`}
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Live Telemetry</h2>
              <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-900/70 px-4 py-3">
                  <dt className="text-slate-400">Latitude</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.latitude}</dd>
                </div>
                <div className="rounded-xl bg-slate-900/70 px-4 py-3">
                  <dt className="text-slate-400">Longitude</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.longitude}</dd>
                </div>
                <div className="rounded-xl bg-slate-900/70 px-4 py-3">
                  <dt className="text-slate-400">Altitude</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.altitude}</dd>
                </div>
                <div className="rounded-xl bg-slate-900/70 px-4 py-3">
                  <dt className="text-slate-400">TLE Updated</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.tleAge}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[0.8rem] text-emerald-200">
                {statusMessage}
              </p>
              {error && (
                <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[0.8rem] text-amber-200">
                  Using cached orbital data while updates retry in the background.
                </p>
              )}
              <p className="text-[0.75rem] text-slate-500">
                Time controls support keyboard shortcuts: space toggles playback, ← / → adjust time, and Shift increases
                the adjustment span.
              </p>
            </div>
          </aside>
        </section>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <TimeControls onSeek={onSeek} />
        </div>

        <div className="mt-6 flex w-full max-w-6xl flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-wrap items-center gap-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                  checked={weightlessnessEnabled && !reducedMotion}
                  onChange={(event) => setWeightlessnessEnabled(event.target.checked)}
                  disabled={reducedMotion}
                />
                Weightlessness
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weightlessnessIntensity}
                onChange={(event) => setWeightlessnessIntensity(Number(event.target.value))}
                disabled={!weightlessnessEnabled || reducedMotion}
                aria-label="Weightlessness drift intensity"
                className="h-1 w-32 appearance-none rounded-full bg-slate-700 accent-sky-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {[
                ['showTerminator', 'Terminator', showTerminator, setShowTerminator],
                ['showClouds', 'Clouds', showClouds, setShowClouds],
                ['showAurora', 'Aurora', showAurora, setShowAurora],
                ['showCityLights', 'City Lights', showCityLights, setShowCityLights],
                ['reducedMotion', 'Reduced Motion', reducedMotion, setReducedMotion],
              ].map(([key, label, value, setter]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                    checked={value}
                    onChange={(event) => setter(event.target.checked)}
                    aria-label={label}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {tooltipVisible && (
            <div className="flex max-w-sm items-start gap-3 rounded-3xl border border-slate-800/60 bg-slate-900/80 px-5 py-4 text-xs text-slate-300">
              <span className="mt-1 text-sky-300">ⓘ</span>
              <p className="flex-1 leading-relaxed">{tooltipContent}</p>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                onClick={handleDismissTooltip}
                aria-label="Dismiss tip"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
