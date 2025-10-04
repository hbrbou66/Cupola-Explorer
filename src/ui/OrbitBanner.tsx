import { useEffect, useState } from 'react';
import type { OrbitStatus } from '../data/orbitService';
import { getOrbitStatus } from '../data/orbitService';

export default function OrbitBanner() {
  const [status, setStatus] = useState<OrbitStatus>(() => getOrbitStatus());

  useEffect(() => {
    const handleStatus = (event: Event) => {
      const detail = (event as CustomEvent<OrbitStatus>).detail;
      if (!detail) return;
      setStatus(detail);
    };
    window.addEventListener('orbit:status', handleStatus);
    return () => window.removeEventListener('orbit:status', handleStatus);
  }, []);

  if (status.status === 'fresh') {
    return null;
  }

  const baseClass =
    'w-full rounded-b-3xl border-t px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] backdrop-blur sm:px-4 sm:py-3 sm:text-sm';

  if (status.status === 'cached') {
    return (
      <div className={`${baseClass} border-sky-500/70 bg-sky-900/80 text-sky-100`}>
        Using cached orbital data while updates retry in the background.
      </div>
    );
  }

  return (
    <div className={`${baseClass} border-amber-500/70 bg-amber-900/80 text-amber-100`}>
      Orbital data is stale. Showing last known orbit and retrying updates…
    </div>
  );
}
