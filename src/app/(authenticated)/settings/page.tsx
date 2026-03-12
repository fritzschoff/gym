import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'en') as 'en' | 'pt';
  const theme = (cookieStore.get('theme')?.value ?? 'system') as
    | 'light'
    | 'dark'
    | 'system';

  return (
    <div className="px-4 py-5 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>
      <SettingsClient
        currentLocale={locale}
        currentTheme={theme}
        tLanguage={t('language')}
        tTheme={t('theme')}
        tChangePassword={t('changePassword')}
        tExportData={t('exportData')}
        tLight={t('light')}
        tDark={t('dark')}
        tSystem={t('system')}
        tCurrentPassword={t('currentPassword')}
        tNewPassword={t('newPassword')}
        tConfirmPassword={t('confirmPassword')}
        tPasswordChanged={t('passwordChanged')}
        tExportSuccess={t('exportSuccess')}
        tLogout={t('logout')}
        tSave="Save"
        tCancel="Cancel"
      />
    </div>
  );
}
