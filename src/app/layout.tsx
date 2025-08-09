import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Overtracking from '@/components/Overtracking';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_NAME} - ${process.env.NEXT_PUBLIC_TAGLINE}`,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  icons: {
    icon: '/images/icons/powershell-icon.svg'
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml'
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200`}
        suppressHydrationWarning
      >
        {/* Analytics */}
        <Overtracking />

        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
