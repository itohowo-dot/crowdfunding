import '@/app/globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'CrowdStack - Blockchain Crowdfunding Platform',
  description: 'Transparent, milestone-based crowdfunding on Stacks blockchain with democratic governance',
  keywords: ['crowdfunding', 'blockchain', 'stacks', 'cryptocurrency', 'fundraising'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
