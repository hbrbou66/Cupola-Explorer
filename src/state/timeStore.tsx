import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

export type TimeMode = 'live' | 'simulated';

export const PLAYBACK_SPEEDS = [1, 10, 60, 600] as const;
const HIGH_SPEED_THRESHOLD = 60;
const HIGH_SPEED_INTERVAL = 200;
const NORMAL_INTERVAL = 16;
const TIMELINE_WINDOW_HOURS = 12;

export interface TimeState {
  currentTime: number;
  mode: TimeMode;
  isPlaying: boolean;
  speed: (typeof PLAYBACK_SPEEDS)[number];
  simulatedTime: number;
}

interface TimeContextValue extends TimeState {
  setSpeed: (speed: TimeState['speed']) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seekTo: (timestamp: number) => void;
  stepBy: (milliseconds: number) => void;
  goLive: () => void;
  setMode: (mode: TimeMode) => void;
  timelineRange: { min: number; max: number };
}

const TimeStoreContext = createContext<TimeContextValue | null>(null);

const createInitialState = (): TimeState => {
  const now = Date.now();
  return {
    currentTime: now,
    simulatedTime: now,
    mode: 'live',
    isPlaying: true,
    speed: 1,
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const clampToTimelineWindow = (timestamp: number) => {
  const windowMs = TIMELINE_WINDOW_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  return clamp(timestamp, now - windowMs, now + windowMs);
};

export function TimeProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<TimeState>(() => createInitialState());
  const accumulatorRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const tick = (timestamp: number) => {
      animationFrame = requestAnimationFrame(tick);

      const last = lastTimestampRef.current ?? timestamp;
      const delta = timestamp - last;
      lastTimestampRef.current = timestamp;

      setState((prev) => {
        if (prev.mode === 'live') {
          accumulatorRef.current = 0;
          const now = Date.now();
          if (Math.abs(now - prev.currentTime) < 1) {
            return prev;
          }
          return {
            ...prev,
            currentTime: now,
            simulatedTime: now,
            isPlaying: true,
          };
        }

        if (!prev.isPlaying) {
          return prev;
        }

        const interval = prev.speed > HIGH_SPEED_THRESHOLD ? HIGH_SPEED_INTERVAL : NORMAL_INTERVAL;
        accumulatorRef.current += delta;
        if (accumulatorRef.current < interval) {
          return prev;
        }

        const steps = Math.floor(accumulatorRef.current / interval);
        accumulatorRef.current -= steps * interval;
        const advance = steps * interval * prev.speed;
        if (advance === 0) {
          return prev;
        }

        const newTime = prev.currentTime + advance;
        return {
          ...prev,
          currentTime: newTime,
          simulatedTime: newTime,
        };
      });
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const setSpeed = useCallback((speed: TimeState['speed']) => {
    setState((prev) => {
      if (prev.speed === speed) {
        return prev;
      }
      return { ...prev, speed };
    });
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => {
      if (prev.mode === 'live') {
        return prev;
      }
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  }, []);

  const play = useCallback(() => {
    setState((prev) => {
      if (prev.mode === 'live' || prev.isPlaying) {
        return prev;
      }
      return { ...prev, isPlaying: true };
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.mode === 'live' || !prev.isPlaying) {
        return prev;
      }
      return { ...prev, isPlaying: false };
    });
  }, []);

  const seekTo = useCallback((timestamp: number) => {
    setState((prev) => {
      const clamped = clampToTimelineWindow(timestamp);
      return {
        ...prev,
        currentTime: clamped,
        simulatedTime: clamped,
        mode: 'simulated',
        isPlaying: false,
      };
    });
  }, []);

  const stepBy = useCallback((milliseconds: number) => {
    setState((prev) => {
      const nextTime = clampToTimelineWindow(prev.currentTime + milliseconds);
      return {
        ...prev,
        currentTime: nextTime,
        simulatedTime: nextTime,
        mode: 'simulated',
      };
    });
  }, []);

  const goLive = useCallback(() => {
    setState(() => createInitialState());
  }, []);

  const setMode = useCallback((mode: TimeMode) => {
    setState((prev) => {
      if (prev.mode === mode) {
        return prev;
      }
      if (mode === 'live') {
        return createInitialState();
      }
      return {
        ...prev,
        mode,
        isPlaying: false,
      };
    });
  }, []);

  const timelineRange = useMemo(() => {
    const windowMs = TIMELINE_WINDOW_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    return {
      min: now - windowMs,
      max: now + windowMs,
    };
  }, [state.currentTime]);

  const value = useMemo<TimeContextValue>(
    () => ({
      ...state,
      setSpeed,
      togglePlay,
      play,
      pause,
      seekTo,
      stepBy,
      goLive,
      setMode,
      timelineRange,
    }),
    [goLive, pause, play, seekTo, setMode, setSpeed, state, stepBy, timelineRange, togglePlay]
  );

  return <TimeStoreContext.Provider value={value}>{children}</TimeStoreContext.Provider>;
}

export const useTimeStore = () => {
  const context = useContext(TimeStoreContext);
  if (!context) {
    throw new Error('useTimeStore must be used within a TimeProvider');
  }
  return context;
};

export const useTimelinePosition = (timestamp: number) => {
  const { timelineRange } = useTimeStore();
  const { min, max } = timelineRange;
  const clamped = clamp(timestamp, min, max);
  return (clamped - min) / (max - min);
};
