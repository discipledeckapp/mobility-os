import { mobirisBrand } from '@mobility-os/ui';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobility OS Control Plane',
  description: 'Platform operator console for Mobility OS staff.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={
          {
            '--mobiris-primary': mobirisBrand.colors.primary,
            '--mobiris-primary-dark': mobirisBrand.colors.primaryDark,
            '--mobiris-primary-light': mobirisBrand.colors.primaryLight,
            '--mobiris-primary-tint': mobirisBrand.colors.primaryTint,
            '--mobiris-ink': mobirisBrand.colors.ink,
            '--mobiris-ink-soft': mobirisBrand.colors.inkSoft,
            '--mobiris-success': mobirisBrand.colors.success,
            '--mobiris-warning': mobirisBrand.colors.warning,
            '--mobiris-error': mobirisBrand.colors.error,
            '--mobiris-background': mobirisBrand.colors.background,
            '--mobiris-card': mobirisBrand.colors.card,
            '--mobiris-border': mobirisBrand.colors.border,
            '--mobiris-radius-card': mobirisBrand.radius.card,
            '--mobiris-radius-button': mobirisBrand.radius.button,
            '--mobiris-font-sans': mobirisBrand.typography.fontSans,
            '--mobiris-font-mono': mobirisBrand.typography.fontMono,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
