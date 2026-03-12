import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { WorkoutPlan } from '@/lib/types';
import { StartSessionButton } from './start-session-button';

interface PlanCardProps {
  plan: WorkoutPlan;
  exerciseCount: number;
  lastSessionDate: string | null;
  localizedName: string;
}

function daysDiff(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export async function PlanCard({
  plan,
  exerciseCount,
  lastSessionDate,
  localizedName,
}: PlanCardProps) {
  const t = await getTranslations('dashboard');

  let lastLabel: string;
  if (!lastSessionDate) {
    lastLabel = t('neverTrained');
  } else {
    const days = daysDiff(lastSessionDate);
    if (days === 0) {
      lastLabel = 'Today';
    } else if (days === 1) {
      lastLabel = `1 ${t('daysAgo')}`;
    } else {
      lastLabel = `${days} ${t('daysAgo')}`;
    }
  }

  // Gradient classes come from plan.color, e.g. "from-blue-700 to-blue-500"
  const gradientClass = `bg-gradient-to-br ${plan.color}`;

  return (
    <div className={`relative rounded-2xl ${gradientClass} p-4 text-white shadow-md`}>
      <Link href={`/plan/${plan.id}`} className="block mb-3">
        <h3 className="text-lg font-bold leading-tight">{localizedName}</h3>
        <p className="mt-0.5 text-sm text-white/70">
          {exerciseCount} {t('exercises')}
        </p>
      </Link>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">
          {t('lastSession')}: {lastLabel}
        </p>
        <StartSessionButton
          planId={plan.id}
          label={t('startSession')}
          className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-60 transition-colors"
        />
      </div>
    </div>
  );
}
