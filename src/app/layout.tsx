import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/components/layout/theme-provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GymTracker",
  description: "Track your gym workouts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const cookieStore = await cookies();
  const theme = (cookieStore.get('theme')?.value ?? 'system') as 'light' | 'dark' | 'system';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-gray-100 transition-colors duration-200`}>
        <ThemeProvider initialTheme={theme}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
