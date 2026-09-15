import { Experience } from '@/components/Experience';
import { getPublicMedia } from '@/lib/media';

export default function Home() {
  const media = getPublicMedia();
  return <Experience media={media} />;
}
