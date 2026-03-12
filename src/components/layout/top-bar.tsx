import { cookies } from 'next/headers';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export async function TopBar() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
        Gym<span className="text-blue-500">Tracker</span>
      </span>
      <div className="flex items-center gap-1">
        <LanguageToggle currentLocale={locale} />
        <ThemeToggle />
      </div>
    </header>
  );
}
