import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'OE-LSC — Black Star',
  description: 'OE-LSC Black Star presented as a design object: exterior, cabin, materials, custom detail and proof.',
};

export default function AircraftPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);

  return (
    <EditorialShell
      eyebrow="AIRCRAFT / OE-LSC"
      title={<>Black<br />Star.</>}
      intro="A Gulfstream G450 presented as one total design system—not a fleet listing. Exterior finish, interior rhythm, material detail and proof are read as one object."
      nextHref="/atelier"
      nextLabel="Enter Atelier"
    >
      <PageSection index="01 / EXTERIOR" title="Surface Before Spec">
        <p>The exterior story is led by matte, gloss, reflection and proportion. Technical data remains secondary to the physical object.</p>
        <div className="page-wide-media">
          <CinematicMedia asset={asset('plane_img.webp')} label="OE-LSC / exterior" eyebrow="BLACK STAR / EXTERIOR" eager />
        </div>
      </PageSection>

      <PageSection index="02 / INTERIOR" title="One System, Inside">
        <p>The cabin is treated as part of the same design language: controlled contrast, disciplined alignment and a material-first hierarchy.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('inplane_seats.webp')} label="Cabin composition" eyebrow="INTERIOR / WIDE" />
          <CinematicMedia asset={asset('one_seat_view.webp')} label="Single seat view" eyebrow="INTERIOR / DETAIL" />
        </div>
      </PageSection>

      <PageSection index="03 / MATERIAL" title="Detail Is Evidence">
        <p>Material stories should be inspectable rather than described with generic luxury language. The current media library is arranged as a vertical mobile story and an editorial desktop composition.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Close seat detail" eyebrow="DETAIL / TEXTURE" />
          <CinematicMedia asset={asset('seat_full view.webp')} label="Seat form" eyebrow="DETAIL / FORM" />
        </div>
      </PageSection>

      <PageSection index="04 / PROOF" title="Award, Quietly">
        <p>The blueprint identifies the International Yacht &amp; Aviation Awards 2024 Private Jet Design award as verified research support. It appears as proof inside the story, not as a trophy wall.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('SCK-img-award.webp')} label="International Yacht & Aviation Awards / 2024" eyebrow="PROOF" />
        </div>
      </PageSection>
    </EditorialShell>
  );
}
