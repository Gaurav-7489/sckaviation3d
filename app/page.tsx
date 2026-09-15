import type { Metadata } from 'next';
import { Experience } from '@/components/Experience';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Attitude With Altitude',
  description: 'Enter the world around OE-LSC Black Star: aircraft transformation, materials, atelier proof, projects and selective access.',
};

export default function Home() {
  const media = getPublicMedia();
  return <Experience media={media} />;
}
