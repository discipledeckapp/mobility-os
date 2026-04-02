import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobiris — Fleet & Driver Operations Platform',
  description:
    'Stop losing money on your fleet. Mobiris helps transport operators track drivers, verify identity, assign vehicles, and collect remittance — all in one place.',
  applicationName: 'Mobiris',
  keywords: [
    'fleet management',
    'driver tracking',
    'transport operators',
    'remittance tracking',
    'vehicle assignment',
    'Nigeria fleet software',
  ],
  openGraph: {
    title: 'Mobiris — Fleet & Driver Operations Platform',
    description:
      'Know your drivers. Track your money. Stay in control. Built for transport and logistics operators in Nigeria.',
    siteName: 'Mobiris',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobiris — Fleet & Driver Operations Platform',
    description: 'Stop losing money on your fleet. Built for transport operators.',
  },
  metadataBase: new URL('https://mobiris.ng'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
