import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';

export const metadata: Metadata = {
  title: 'Stories from SCK Aviation',
  description: 'Discover Black Star through its materials, transformation and design story.',
};

const stories = [
  { label: 'DESIGN', title: 'The depth of black.', body: 'A closer look at the textures and finishes behind the SCK signature.', href: '/design-philosophy', image: '/images/sck-portoro-marble.webp', alt: 'Natural veins in Black Star’s dark Portoro marble' },
  { label: 'TRANSFORMATION', title: 'An idea, made real.', body: 'The vision and detail that brought Black Star to life.', href: '/atelier', image: '/images/sck-galley.webp', alt: 'The finished galley aboard OE-LSC' },
  { label: 'THE AIRCRAFT', title: 'Meet Black Star.', body: 'Step closer to the Gulfstream G450 with a character all its own.', href: '/aircraft', image: '/images/sck-aircraft-flight.webp', alt: 'Black Star in flight above the clouds' },
];

export default function JournalPage() {
  return (
    <EditorialShell
      eyebrow="THE JOURNAL"
      title={<>Stories<br />from SCK.</>}
      intro="Discover the ideas, materials and moments behind Black Star."
      image={{ src: '/images/sck-cabin-detail.webp', alt: 'A view through the bespoke Black Star cabin' }}
      nextHref="/about"
      nextLabel="Meet SCK Aviation"
    >
      <PageSection index="01 / DISCOVER" title="A closer look.">
        <div className="journal-grid">
          {stories.map((story) => (
            <Link className="journal-card" href={story.href} key={story.title}>
              <img src={story.image} alt={story.alt} loading="lazy" decoding="async" />
              <span>{story.label}</span><h3>{story.title}</h3><p>{story.body}</p>
              <span className="journal-read">Explore the story <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
      </PageSection>
    </EditorialShell>
  );
}
