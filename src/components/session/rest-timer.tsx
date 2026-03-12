'use client';

import { useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  active: boolean;
  onComplete: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const playBeep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 200);
  } catch {
    // Audio not available — silent fail
  }
};

export function RestTimer({ seconds, active, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset countdown whenever it becomes active
  useEffect(() => {
    if (active) {
      setRemaining(seconds);
    }
  }, [active, seconds]);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          playBeep();
          try {
            navigator.vibrate?.([200, 100, 200]);
          } catch {
            // vibration not available
          }
          // defer onComplete to avoid state-during-render issues
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const pct = seconds > 0 ? remaining / seconds : 0;
  const urgency = pct < 0.25;

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-5 py-3 shadow-md transition-colors ${
        urgency
          ? 'bg-gradient-to-r from-red-500 to-orange-400'
          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/90"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
        <span className="text-sm font-semibold text-white/90">Rest</span>
      </div>
      <span className="font-mono text-2xl font-bold tracking-widest text-white">
        {formatTime(remaining)}
      </span>
      <button
        onClick={() => {
          setRemaining(0);
          onCompleteRef.current();
        }}
        className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
