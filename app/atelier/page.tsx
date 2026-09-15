import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'The Atelier — Black Star’s Transformation',
  description: 'Discover the design choices and craftsmanship behind the transformation of the SCK Aviation Gulfstream G450.',
};

const steps = [
  ['01', 'The idea', 'A single vision for the exterior, cabin and every detail in between.'],
  ['02', 'The finish', 'Matte and gloss create depth across the black exterior.'],
  ['03', 'The cabin', 'Seating, marble and metal bring texture and comfort into the same space.'],
  ['04', 'Black Star', 'The finished Gulfstream G450, with the SCK signature throughout.'],
] as const;

export default function AtelierPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);
  return (
    <EditorialShell
      eyebrow="THE ATELIER"
      title={<>An idea.<br />Made real.</>}
      intro="Black Star began with a clear vision. Its transformation brought the aircraft, cabin and materials into one carefully considered whole."
      image={{ src: '/images/sck-galley.webp', alt: 'Black Portoro marble and metal finishes in the OE-LSC galley' }}
      nextHref="/projects"
      nextLabel="Explore our projects"
    >
      <PageSection index="01 / TRANSFORMATION" title="From vision to detail.">
        <div className="numbered-timeline">{steps.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </PageSection>
      <PageSection index="02 / THE FILM" title="Made for the screen.">
        <p>Watch Black Star in the world of Mission: Impossible 8.</p>
        <div className="page-wide-media"><CinematicMedia asset={asset('vid-mi-opt-v1.mp4')} label="Black Star / Mission: Impossible" eyebrow="WATCH THE FILM" controls /></div>
      </PageSection>
      <PageSection index="03 / CRAFT" title="A closer connection.">
        <p>The feel of the fabric. The shape of a seat. The light across the marble. Design comes to life in the details you see and touch.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Tailored upholstery" eyebrow="THE SEATING" />
          <CinematicMedia asset={asset('sck-cabin-detail.webp')} label="The view through the cabin" eyebrow="THE CABIN" />
        </div>
      </PageSection>
    </EditorialShell>
  );
}
