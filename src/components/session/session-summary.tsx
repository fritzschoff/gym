'use client';

import { useRouter } from 'next/navigation';

interface SessionSummaryProps {
  durationSeconds: number;
  setsCompleted: number;
  totalSets: number;
  newPRs: string[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function SessionSummary({
  durationSeconds,
  setsCompleted,
  totalSets,
  newPRs,
}: SessionSummaryProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Workout Complete!</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-700">
          <div className="py-5 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(durationSeconds)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Duration</p>
          </div>
          <div className="py-5 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {setsCompleted}
              <span className="text-lg text-gray-400">/{totalSets}</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Sets Completed</p>
          </div>
        </div>

        {/* PRs */}
        {newPRs.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 dark:border-slate-700">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              New Personal Records
            </p>
            <ul className="space-y-1">
              {newPRs.map((name) => (
                <li
                  key={name}
                  className="rounded-lg bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action */}
        <div className="px-6 pb-6 pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
