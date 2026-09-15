import type { Metadata } from 'next';
import { Experience } from '@/components/Experience';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Attitude With Altitude',
  description: 'Enter the SCK Aviation world: a cinematic private aviation experience shaped by presence, precision and a singular point of view.',
};

export default function Home() {
  const media = getPublicMedia();
  return <Experience media={media} />;
}
