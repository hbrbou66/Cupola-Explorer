import { useCallback, useEffect, useRef } from 'react';
import { useTimeStore } from '../state/timeStore.tsx';

type TimelineSnapshot = {
  mode: 'live' | 'simulated';
  speed: number;
  wasPlaying: boolean;
};

const ALLOWED_SPEEDS = new Set([1, 10, 60, 200]);

export const useFastTimelineDemo = () => {
  const { mode, speed, isPlaying, setMode, setSpeed, play, pause } = useTimeStore();
  const timeoutRef = useRef<number | null>(null);
  const snapshotRef = useRef<TimelineSnapshot | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleFastTimelineDemo = useCallback(
    (targetSpeed = 200) => {
      const playbackSpeed = ALLOWED_SPEEDS.has(targetSpeed) ? targetSpeed : 200;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      snapshotRef.current = {
        mode,
        speed,
        wasPlaying: isPlaying,
      };

      if (mode === 'live') {
        setMode('simulated');
      }

      setSpeed(playbackSpeed);
      play();

      timeoutRef.current = window.setTimeout(() => {
        const previous = snapshotRef.current;
        snapshotRef.current = null;
        if (!previous) {
          return;
        }
        if (previous.mode === 'live') {
          setMode('live');
          return;
        }
        setSpeed(previous.speed);
        if (previous.wasPlaying) {
          play();
        } else {
          pause();
        }
      }, 8000);
    },
    [mode, speed, isPlaying, setMode, setSpeed, play, pause]
  );

  return handleFastTimelineDemo;
};

export default useFastTimelineDemo;
