import type { Metadata } from 'next';
import Link from 'next/link';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Projects & Private Travel',
  description: 'SCK Aviation for film productions, special projects and selected private travel.',
};

export default function ProjectsPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);
  return (
    <EditorialShell
      eyebrow="PROJECTS & PRIVATE TRAVEL"
      title={<>A wider<br />world.</>}
      intro="From the cinema screen to selected private journeys, Black Star brings its own presence to every setting."
      image={{ src: '/images/sck-aircraft-flight.webp', alt: 'SCK Aviation’s Black Star flying above the clouds' }}
      nextHref="/access"
      nextLabel="Discuss your plans"
    >
      <PageSection index="01 / PRIVATE TRAVEL" title="A journey of your own.">
        <p>Our selective charter offering brings Black Star closer. Share your route, dates and plans with our team.</p>
        <div className="page-wide-media page-portrait-film"><CinematicMedia asset={asset('vid-charter-feature-v1.mp4')} label="Travel with SCK Aviation" eyebrow="WATCH THE FILM" controls /></div>
        <Link href="/access?type=charter" className="text-link">Enquire about a journey <span aria-hidden="true">→</span></Link>
      </PageSection>
      <PageSection index="02 / PRODUCTIONS" title="A cinematic presence.">
        <p>Featured in Mission: Impossible 8, OE-LSC brings an unmistakable silhouette to the screen. We welcome conversations about film productions and special projects.</p>
        <div className="page-wide-media"><CinematicMedia asset={asset('sck-aircraft-hangar.webp')} label="OE-LSC in the hangar" /></div>
        <Link href="/access?type=production" className="text-link">Tell us about your project <span aria-hidden="true">→</span></Link>
      </PageSection>
    </EditorialShell>
  );
}
