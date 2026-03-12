'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Dot,
} from 'recharts';

interface WeightDataPoint {
  date: string;
  maxWeight: number;
  isPR: boolean;
}

interface WeightChartProps {
  data: WeightDataPoint[];
}

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: WeightDataPoint;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  if (payload.isPR) {
    return <Dot cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#f59e0b" />;
  }
  return <Dot cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="#3b82f6" />;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: WeightDataPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const isPR = payload[0]?.payload?.isPR;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {payload[0]?.value} kg
        {isPR && (
          <span className="ml-1.5 text-xs font-normal text-amber-500">PR</span>
        )}
      </p>
    </div>
  );
}

export function WeightChart({ data }: WeightChartProps) {
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
          dataKey="maxWeight"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={(props) => <CustomDot key={`${props.cx}-${props.cy}`} {...props} />}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
