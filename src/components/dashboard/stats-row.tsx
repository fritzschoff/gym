import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

async function getStats() {
  const supabase = await createServerSupabaseClient();

  // Start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - daysFromMonday);

  // Sessions this week
  const { count: weekCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', weekStart.toISOString())
    .not('finished_at', 'is', null);

  // Streak: consecutive days with finished sessions (most recent first)
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('started_at')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(60);

  let streak = 0;
  if (recentSessions && recentSessions.length > 0) {
    const sessionDays = new Set(
      recentSessions.map((s) => {
        const d = new Date(s.started_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(today);

    // Allow streak to start from today or yesterday
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if (!sessionDays.has(todayKey)) {
      check.setDate(check.getDate() - 1);
    }

    while (true) {
      const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
      if (!sessionDays.has(key)) break;
      streak++;
      check.setDate(check.getDate() - 1);
    }
  }

  return {
    sessionsThisWeek: weekCount ?? 0,
    streak,
    newPRs: 0,
  };
}

export async function StatsRow() {
  const t = await getTranslations('dashboard');
  const { sessionsThisWeek, streak, newPRs } = await getStats();

  const stats = [
    {
      label: t('thisWeek'),
      value: sessionsThisWeek,
      accent: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      label: t('streak'),
      value: streak,
      accent: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
    },
    {
      label: t('newPRs'),
      value: newPRs,
      accent: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, accent, bg, border }) => (
        <div
          key={label}
          className={`rounded-xl border ${border} ${bg} p-3 text-center`}
        >
          <p className={`text-2xl font-bold ${accent}`}>{value}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
