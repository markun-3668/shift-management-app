// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShiftProvider } from '../contexts/ShiftContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'アルバイトシフト表生成アプリ',
  description: '遺伝的アルゴリズムを用いたアルバイトのシフト表を生成するアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ShiftProvider>
          <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">アルバイトシフト表生成アプリ</h1>
            {children}
          </main>
        </ShiftProvider>
      </body>
    </html>
  );
}