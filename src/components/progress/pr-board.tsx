'use client';

interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface PRBoardProps {
  records: PRRecord[];
}

export function PRBoard({ records }: PRBoardProps) {
  if (records.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No personal records yet
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
              Exercise
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
              Weight
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
              Reps
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={`${record.exerciseName}-${index}`}
              className="border-b border-gray-100 last:border-0 dark:border-slate-800"
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {record.exerciseName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                {record.weight} kg
              </td>
              <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                {record.reps}
              </td>
              <td className="px-3 py-2.5 text-right text-xs text-gray-400 dark:text-gray-500">
                {record.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
