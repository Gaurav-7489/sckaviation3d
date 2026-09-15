import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Design Philosophy',
  description: 'The SCK Aviation visual signature: black, material, shape, typography and sourcing as one design system.',
};

export default function DesignPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);

  return (
    <EditorialShell
      eyebrow="DESIGN PHILOSOPHY"
      title={<>Material<br />First.</>}
      intro="The researched signature is not a palette alone. Black, finish, textile, metal, typography and alignment are treated as a connected system."
      nextHref="/journal"
      nextLabel="Open Journal"
    >
      <PageSection index="01 / COLOR" title="Black Has Depth">
        <p>Deep black is the canvas, matte black is the physical reference, off-white carries primary text, and chrome/silver appear as controlled highlights rather than decoration.</p>
        <div className="material-library">
          <article className="material-card"><span>#050507</span><h3>Deep Black</h3></article>
          <article className="material-card"><span>#0A0A0A</span><h3>Matte Black</h3></article>
          <article className="material-card"><span>#E8E8E8</span><h3>Chrome</h3></article>
        </div>
      </PageSection>

      <PageSection index="02 / MATERIAL" title="Evidence Before Claim">
        <p>Material modules are designed to support macro media and concise sourcing/detail stories. No generic beige-luxury filler and no hover-only information.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Material detail" eyebrow="TEXTURE" />
          <CinematicMedia asset={asset('seat_full view.webp')} label="Seat form" eyebrow="FORM" />
        </div>
      </PageSection>

      <PageSection index="03 / SHAPE" title="Tense. Cut. Carved.">
        <p>Sharp geometry, negative space and disciplined alignment replace rounded-card language. Motion remains restrained and only exists to intensify or explain the object.</p>
      </PageSection>
    </EditorialShell>
  );
}
