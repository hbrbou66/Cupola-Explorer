import { useMemo } from 'react';
import { PLAYBACK_SPEEDS, useTimeStore } from '../state/timeStore.tsx';

const formatOffset = (offsetMs) => {
  const sign = offsetMs >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMs);
  const hours = Math.floor(absolute / 3600000);
  const minutes = Math.floor((absolute % 3600000) / 60000);
  const seconds = Math.floor((absolute % 60000) / 1000);
  const parts = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(' : ');
  return `${sign}${parts}`;
};

const TimeControls = ({ onSeek }) => {
  const {
    currentTime,
    mode,
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    timelineRange,
    goLive,
  } = useTimeStore();

  const now = Date.now();
  const isLive = mode === 'live';
  const offsetLabel = useMemo(() => formatOffset(currentTime - now), [currentTime, now]);
  const currentTimeLabel = useMemo(
    () => new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [currentTime]
  );

  const onRangeChange = (event) => {
    const value = Number(event.target.value);
    onSeek(value);
  };

  return (
    <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 transition hover:border-sky-400/60 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
          disabled={isLive}
        >
          <span className="text-lg font-semibold">{isLive ? '■' : isPlaying ? '❚❚' : '▶'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Playback speed">
          {PLAYBACK_SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                value === speed
                  ? 'border-sky-400/70 bg-sky-500/20 text-sky-100'
                  : 'border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-slate-500'
              }`}
              disabled={isLive && value !== 1}
            >
              {value}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={goLive}
          className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
            isLive
              ? 'border border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
              : 'border border-slate-700/60 bg-slate-800/60 text-slate-200 hover:border-sky-400/60 hover:text-sky-200'
          }`}
          aria-pressed={isLive}
        >
          Live
        </button>
      </div>

      <label className="flex flex-col gap-1 text-xs text-slate-400">
        <span className="sr-only">Timeline scrubber</span>
        <input
          type="range"
          min={timelineRange.min}
          max={timelineRange.max}
          value={currentTime}
          onChange={onRangeChange}
          className="h-1 w-full appearance-none rounded-full bg-slate-700 accent-sky-400"
        />
        <div className="flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-[0.25em]">
          <span>{formatOffset(timelineRange.min - now)}</span>
          <span>{isLive ? 'Live orbit' : `Offset ${offsetLabel}`}</span>
          <span>{formatOffset(timelineRange.max - now)}</span>
        </div>
      </label>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] ${
          isLive ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'
        }`}>
          <span className="font-semibold uppercase tracking-[0.4em]">{isLive ? 'Live' : 'Sim'}</span>
          <span aria-live="polite">{currentTimeLabel}</span>
        </div>
        {!isLive && <span>Use ←/→ for ±10s • Shift+←/→ for ±5m</span>}
      </div>
    </div>
  );
};

export default TimeControls;
