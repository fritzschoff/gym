'use client';

import { useEffect, useState } from 'react';

interface ElapsedTimerProps {
  startedAt: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ElapsedTimer({ startedAt }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    const tick = () => {
      const now = Date.now();
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 shadow-md">
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
        className="text-blue-100"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="font-mono text-2xl font-bold tracking-widest text-white">
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
}
