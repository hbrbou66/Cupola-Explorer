import { toastOnce, resetToastKey } from '../ui/toast';

export type OrbitStatus = {
  status: 'fresh' | 'cached' | 'stale';
  updatedAt?: number;
};

export type StoredTle = {
  line1: string;
  line2: string;
  t: number;
};

const TLE_STORAGE_KEY = 'cupola-iss-tle';
const MAX_STALENESS_MS = 6 * 60 * 60 * 1000;
const RETRY_SCHEDULE = [2, 5, 15, 60, 180, 600].map((seconds) => seconds * 1000);

const status: OrbitStatus = { status: 'fresh', updatedAt: undefined };
let retryIndex = 0;
let inFlight = false;
let warnedThisEpisode = false;

status.updatedAt = readCachedTle()?.t ?? status.updatedAt;

function dispatchStatus() {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<OrbitStatus>('orbit:status', {
      detail: { ...status },
    })
  );
}

function updateStatus(next: OrbitStatus) {
  status.status = next.status;
  status.updatedAt = next.updatedAt;
  dispatchStatus();
}

function readCachedTle(): StoredTle | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(TLE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredTle>;
    if (typeof parsed?.line1 === 'string' && typeof parsed?.line2 === 'string' && typeof parsed?.t === 'number') {
      return { line1: parsed.line1, line2: parsed.line2, t: parsed.t };
    }
  } catch (error) {
    console.warn('[orbit] unable to parse cached TLE', error);
  }
  return null;
}

function persistTle(record: StoredTle) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(TLE_STORAGE_KEY, JSON.stringify(record));
}

function nextRetryDelay() {
  const delay = RETRY_SCHEDULE[Math.min(retryIndex, RETRY_SCHEDULE.length - 1)];
  if (retryIndex < RETRY_SCHEDULE.length - 1) {
    retryIndex += 1;
  }
  return delay;
}

async function fetchNetworkTle(): Promise<{ line1: string; line2: string }> {
  const response = await fetch(
    'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE',
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ISS TLE: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const line1 = lines.find((value) => value.startsWith('1 '));
  const line2 = lines.find((value) => value.startsWith('2 '));
  if (!line1 || !line2) {
    throw new Error('Received malformed ISS TLE');
  }
  return { line1, line2 };
}

export function getOrbitStatus(): OrbitStatus {
  return { ...status };
}

export { status as orbitStatus };

export function loadCachedTLE(): StoredTle | null {
  return readCachedTle();
}

export async function fetchTLE(): Promise<StoredTle> {
  const tle = await fetchNetworkTle();
  const record: StoredTle = { ...tle, t: Date.now() };
  persistTle(record);
  retryIndex = 0;
  warnedThisEpisode = false;
  resetToastKey('tle-cached');
  updateStatus({ status: 'fresh', updatedAt: record.t });
  return record;
}

export async function ensureTLEFresh(): Promise<void> {
  if (inFlight) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  inFlight = true;
  try {
    await fetchTLE();
    inFlight = false;
  } catch (error) {
    const cached = loadCachedTLE();
    if (cached) {
      const age = Date.now() - cached.t;
      const isStale = age > MAX_STALENESS_MS;
      const message = isStale
        ? 'Orbital updates unavailable. Showing last known orbit (refreshing in background)…'
        : 'Using cached orbital data while updates retry in the background.';
      const tone = isStale ? 'warning' : 'info';
      if (!warnedThisEpisode) {
        const logMessage = isStale
          ? '[orbit] cached ISS TLE is stale; using last known values.'
          : '[orbit] using cached ISS TLE while updates retry.';
        console.warn(logMessage, error);
        warnedThisEpisode = true;
      }
      updateStatus({ status: isStale ? 'stale' : 'cached', updatedAt: cached.t });
      toastOnce('tle-cached', message, {
        type: tone,
        timeoutMs: isStale ? 6000 : 5000,
      });
    } else {
      if (!warnedThisEpisode) {
        console.error('[orbit] no cached TLE available after fetch failure.', error);
        warnedThisEpisode = true;
      }
      updateStatus({ status: 'stale', updatedAt: undefined });
      toastOnce('tle-cached', 'No orbital data available. Retrying…', {
        type: 'error',
        timeoutMs: 6000,
      });
    }
    const delay = nextRetryDelay();
    window.setTimeout(() => {
      inFlight = false;
      ensureTLEFresh();
    }, delay);
  }
}
