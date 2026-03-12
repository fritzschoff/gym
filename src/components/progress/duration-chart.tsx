'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DurationDataPoint {
  date: string;
  minutes: number;
}

interface DurationChartProps {
  data: DurationDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {payload[0]?.value} min
      </p>
    </div>
  );
}

export function DurationChart({ data }: DurationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          className="text-gray-500 dark:text-gray-400"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          className="text-gray-500 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
