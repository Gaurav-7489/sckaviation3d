import type { Metadata } from 'next';
import 'lenis/dist/lenis.css';
import './globals.css';
import './intro-media.css';
import './pdr.css';
import './gallery.css';
import './intro-continuity.css';
import './intro-skip.css';
import './a11y.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sckaviation.com'),
  title: {
    default: 'SCK Aviation — Attitude With Altitude',
    template: '%s — SCK Aviation',
  },
  description: 'SCK Aviation — aircraft transformation, OE-LSC Black Star, selective access and special projects.',
  openGraph: {
    title: 'SCK Aviation — Attitude With Altitude',
    description: 'A dark, material-led digital experience around OE-LSC Black Star and the SCK Aviation atelier.',
    type: 'website',
    images: [{ url: '/plane_img.webp', alt: 'SCK Aviation aircraft' }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
