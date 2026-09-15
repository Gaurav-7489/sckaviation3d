import type { Metadata } from 'next';
import { AircraftGallery } from '@/components/media/AircraftGallery';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'OE-LSC — Black Star',
  description: 'Meet OE-LSC, the SCK Aviation Gulfstream G450. Explore its matte-black exterior, custom cabin and award-winning design.',
};

export default function AircraftPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);
  return (
    <EditorialShell
      eyebrow="THE AIRCRAFT / OE-LSC"
      title={<>Black<br />Star.</>}
      intro="A Gulfstream G450 with a character of its own. Matte black outside. A carefully composed world within."
      image={{ src: '/images/sck-aircraft-hangar.webp', alt: 'The matte-black nose and cockpit of OE-LSC in the hangar' }}
      nextHref="/atelier"
      nextLabel="The transformation"
    >
      <PageSection index="01 / EXTERIOR & CABIN" title="Take a closer look.">
        <p>Explore the lines, textures and details that make Black Star unmistakable.</p>
        <AircraftGallery assets={[
          { asset: asset('plane_img.webp'), label: 'OE-LSC above the runway' },
          { asset: asset('inplane_seats.webp'), label: 'The Black Star cabin' },
          { asset: asset('one_seat_view.webp'), label: 'A seat by the window' },
          { asset: asset('sck-galley.webp'), label: 'Portoro marble in the galley' },
          { asset: asset('sck-aircraft-flight.webp'), label: 'Black Star in flight' },
        ]} />
      </PageSection>
      <PageSection index="02 / THE DETAILS" title="Every detail belongs.">
        <p>Soft grey seating, dark surfaces and the natural veins of Portoro marble bring the cabin together. Each finish is part of the same idea.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Tailored cabin seating" eyebrow="TEXTURE" />
          <CinematicMedia asset={asset('sck-portoro-marble.webp')} label="The natural pattern of Portoro marble" eyebrow="MATERIAL" />
        </div>
      </PageSection>
      <PageSection index="03 / RECOGNITION" title="Award-winning design.">
        <p>Black Star received the Private Jet Design award at the International Yacht &amp; Aviation Awards 2024.</p>
        <div className="page-award-media"><CinematicMedia asset={asset('SCK-img-award.webp')} label="International Yacht & Aviation Awards, 2024" /></div>
        <p><a className="text-link" href="https://thedesignawards.co.uk/sck-aviation-gulfstream-g450/" target="_blank" rel="noreferrer">Discover the award <span aria-hidden="true">↗</span></a></p>
      </PageSection>
    </EditorialShell>
  );
}
