import type { Metadata } from 'next';
import { Experience } from '@/components/Experience';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Attitude With Altitude',
  description: 'Discover Black Star: distinctive aircraft design, considered interiors, private journeys and special projects from SCK Aviation.',
};

export default function Home() {
  const media = getPublicMedia();
  return <Experience media={media} />;
}
