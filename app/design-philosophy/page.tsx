import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Design Philosophy',
  description: 'Explore the materials, finishes and individual details that shape the SCK Aviation signature.',
};

export default function DesignPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);
  return (
    <EditorialShell
      eyebrow="DESIGN PHILOSOPHY"
      title={<>Feel the<br />difference.</>}
      intro="Black is the starting point. Texture, light and the character of each material give it depth."
      image={{ src: '/images/sck-portoro-marble.webp', alt: 'Light tracing the natural veins of Black Star’s Portoro marble' }}
      nextHref="/journal"
      nextLabel="Explore the stories"
    >
      <PageSection index="01 / THE FINISH" title="Many shades of black.">
        <p>A matte surface absorbs the light. Gloss catches it. Together, they give the exterior its changing character.</p>
        <div className="page-wide-media"><CinematicMedia asset={asset('sck-aircraft-hangar.webp')} label="Light across the matte-black exterior" /></div>
      </PageSection>
      <PageSection index="02 / THE MATERIALS" title="Chosen to be felt.">
        <p>Soft fabric, cool metal and naturally patterned marble. The cabin brings different sensations into a calm, connected space.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="The texture of the seating" eyebrow="SOFT FABRIC" />
          <CinematicMedia asset={asset('sck-galley.webp')} label="Portoro marble and metal" eyebrow="NATURAL CONTRAST" />
        </div>
      </PageSection>
      <PageSection index="03 / THE WHOLE" title="One clear idea.">
        <p>The shape of a seat, the pattern of the carpet and the finish of the galley share the same point of view. Each detail feels at home in the whole.</p>
        <div className="page-wide-media"><CinematicMedia asset={asset('inplane_seats.webp')} label="The complete Black Star cabin" /></div>
      </PageSection>
    </EditorialShell>
  );
}
