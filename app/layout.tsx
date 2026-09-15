import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SCK Aviation — 3D Experience',
  description: 'Interactive digital experience for SCK Aviation and OE-LSC Black Star.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
