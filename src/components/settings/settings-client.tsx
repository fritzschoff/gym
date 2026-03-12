'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateLanguage, updateTheme } from '@/actions/preferences';
import { changePassword, logout } from '@/actions/auth';
import { exportData } from '@/actions/export';
import { useTheme } from '@/components/layout/theme-provider';

interface SettingsClientProps {
  currentLocale: 'en' | 'pt';
  currentTheme: 'light' | 'dark' | 'system';
  tLanguage: string;
  tTheme: string;
  tChangePassword: string;
  tExportData: string;
  tLight: string;
  tDark: string;
  tSystem: string;
  tCurrentPassword: string;
  tNewPassword: string;
  tConfirmPassword: string;
  tPasswordChanged: string;
  tExportSuccess: string;
  tLogout: string;
  tSave: string;
  tCancel: string;
}

export function SettingsClient({
  currentLocale,
  tLanguage,
  tTheme,
  tChangePassword,
  tExportData,
  tLight,
  tDark,
  tSystem,
  tCurrentPassword,
  tNewPassword,
  tConfirmPassword,
  tPasswordChanged,
  tExportSuccess,
  tLogout,
  tSave,
}: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [locale, setLocale] = useState(currentLocale);

  const [isPendingLang, startLangTransition] = useTransition();
  const [isPendingTheme, startThemeTransition] = useTransition();
  const [isPendingPw, startPwTransition] = useTransition();
  const [isPendingExport, startExportTransition] = useTransition();
  const [isPendingLogout, startLogoutTransition] = useTransition();

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleLanguage = (lang: 'en' | 'pt') => {
    setLocale(lang);
    startLangTransition(async () => {
      await updateLanguage(lang);
      router.refresh();
    });
  };

  const handleTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    startThemeTransition(async () => {
      await updateTheme(t);
      router.refresh();
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    const formData = new FormData(e.currentTarget);
    startPwTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        setPwError(result.error);
      } else if (result?.success) {
        setPwSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleExport = () => {
    setExportSuccess(false);
    startExportTransition(async () => {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymtracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    });
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logout();
    });
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {tLanguage}
        </h2>
        <div className="flex gap-2">
          {(['en', 'pt'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguage(lang)}
              disabled={isPendingLang}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                locale === lang
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
              } disabled:opacity-60`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {tTheme}
        </h2>
        <div className="flex gap-2">
          {(
            [
              { value: 'light', label: tLight },
              { value: 'dark', label: tDark },
              { value: 'system', label: tSystem },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleTheme(value)}
              disabled={isPendingTheme}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                theme === value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
              } disabled:opacity-60`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {tChangePassword}
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            name="currentPassword"
            type="password"
            placeholder={tCurrentPassword}
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-gray-500"
          />
          <input
            name="newPassword"
            type="password"
            placeholder={tNewPassword}
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-gray-500"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder={tConfirmPassword}
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-gray-500"
          />
          {pwError && (
            <p className="text-xs text-red-500">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400">
              {tPasswordChanged}
            </p>
          )}
          <button
            type="submit"
            disabled={isPendingPw}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPendingPw ? '...' : tSave}
          </button>
        </form>
      </section>

      {/* Export Data */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {tExportData}
        </h2>
        {exportSuccess && (
          <p className="mb-2 text-xs text-green-600 dark:text-green-400">
            {tExportSuccess}
          </p>
        )}
        <button
          onClick={handleExport}
          disabled={isPendingExport}
          className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors"
        >
          {isPendingExport ? '...' : tExportData}
        </button>
      </section>

      {/* Logout */}
      <section>
        <button
          onClick={handleLogout}
          disabled={isPendingLogout}
          className="w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
        >
          {isPendingLogout ? '...' : tLogout}
        </button>
      </section>
    </div>
  );
}
