import type { Metadata } from 'next';
import './globals.css';
import './pdr.css';
import './gallery.css';
import './a11y.css';
import './experience.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sckaviation.com'),
  title: {
    default: 'SCK Aviation — Attitude With Altitude',
    template: '%s — SCK Aviation',
  },
  description: 'SCK Aviation — aircraft transformation, OE-LSC Black Star, selective access and special projects.',
  openGraph: {
    title: 'SCK Aviation — Attitude With Altitude',
    description: 'Discover Black Star. Aircraft transformation, distinctive design, private journeys and special projects from SCK Aviation.',
    type: 'website',
    images: [{ url: '/plane_img.webp', alt: 'SCK Aviation aircraft' }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><a className="skip-to-content" href="#main-content">Skip to content</a>{children}</body>
    </html>
  );
}
