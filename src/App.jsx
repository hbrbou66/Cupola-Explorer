import { useEffect, useMemo, useRef, useState } from 'react';
import ISSGlobe, { TRAIL_POINT_COUNT } from './components/ISSGlobe.jsx';

const API_URL = 'http://api.open-notify.org/iss-now.json';

const formatCoordinate = (value, type) => {
  if (Number.isNaN(value)) {
    return '—';
  }
  const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(2)}° ${direction}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

function App() {
  const [issPosition, setIssPosition] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);
  const cacheRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIssPosition = async (force = false) => {
      const now = Date.now();
      if (!force && cacheRef.current && now - lastFetchRef.current < 4500) {
        if (isMounted) {
          setIssPosition(cacheRef.current.position);
          setLastUpdated(cacheRef.current.timestamp);
        }
        return;
      }

      try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const data = await response.json();
        const latitude = parseFloat(data?.iss_position?.latitude);
        const longitude = parseFloat(data?.iss_position?.longitude);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          throw new Error('Received invalid ISS coordinates');
        }

        const position = { latitude, longitude };
        const timestamp = (data?.timestamp ?? Math.floor(Date.now() / 1000)) * 1000;

        cacheRef.current = { position, timestamp };
        lastFetchRef.current = now;

        if (isMounted) {
          setIssPosition(position);
          setLastUpdated(timestamp);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message ?? 'Unable to retrieve ISS position');
        }
      }
    };

    fetchIssPosition(true);
    const interval = setInterval(fetchIssPosition, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const telemetry = useMemo(
    () => ({
      latitude: issPosition ? formatCoordinate(issPosition.latitude, 'lat') : '—',
      longitude: issPosition ? formatCoordinate(issPosition.longitude, 'lon') : '—',
      lastUpdated: formatTimestamp(lastUpdated),
    }),
    [issPosition, lastUpdated]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <h1 className="text-xl font-semibold uppercase tracking-[0.25em] text-sky-300 sm:text-2xl">
            Cupola Explorer – ISS Tracker
          </h1>
          <p className="text-sm text-slate-400">Live orbital data sourced from NASA Open Notify</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex w-full max-w-6xl flex-1 flex-col gap-6 lg:flex-row">
          <div className="flex-1 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/60 p-3 shadow-[0_35px_120px_-50px_rgba(56,189,248,0.45)]">
            <ISSGlobe position={issPosition} />
          </div>

          <aside className="flex w-full max-w-lg flex-col justify-between gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Live Telemetry</h2>
              <dl className="mt-6 space-y-4 text-sm text-slate-200">
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3">
                  <dt className="text-slate-400">Latitude</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.latitude}</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3">
                  <dt className="text-slate-400">Longitude</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.longitude}</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3">
                  <dt className="text-slate-400">Last Updated</dt>
                  <dd className="font-mono text-base text-sky-200">{telemetry.lastUpdated}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <p>
                The orbit path trails the last {TRAIL_POINT_COUNT * 5} seconds of recorded positions. Updates occur every
                five seconds with built-in caching to minimize API usage.
              </p>
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[0.8rem] text-red-200">
                  {error}
                </p>
              ) : (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[0.8rem] text-emerald-200">
                  Tracking nominal. The position marker updates continuously as new data arrives.
                </p>
              )}
              <p className="text-[0.75rem] text-slate-500">
                Tip: Rotate or pinch-zoom the page to explore the globe. The visualization is optimized for both desktop
                and mobile screens.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
