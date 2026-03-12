'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface FrequencyDataPoint {
  week: string;
  count: number;
}

interface FrequencyChartProps {
  data: FrequencyDataPoint[];
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
        {payload[0]?.value} sessions
      </p>
    </div>
  );
}

export function FrequencyChart({ data }: FrequencyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          className="text-gray-500 dark:text-gray-400"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          className="text-gray-500 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
