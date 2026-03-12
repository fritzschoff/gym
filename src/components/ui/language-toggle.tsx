'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateLanguage } from '@/actions/preferences';

interface LanguageToggleProps {
  currentLocale: string;
}

export function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextLocale = currentLocale === 'en' ? 'pt' : 'en';
    startTransition(async () => {
      await updateLanguage(nextLocale as 'en' | 'pt');
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
      aria-label="Toggle language"
    >
      {currentLocale === 'en' ? 'PT' : 'EN'}
    </button>
  );
}
