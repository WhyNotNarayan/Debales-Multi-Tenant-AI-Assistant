import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Debales AI Workspace | Premium Multi-Tenant platform',
  description: 'Enterprise-grade AI workspace for multi-tenant organizations.',
}

import Providers from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
