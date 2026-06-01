import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Deriv Trading Platform',
  description: 'Plataforma de negociação profissional para a corretora Deriv',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
