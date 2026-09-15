import type { Metadata } from 'next';
import { AircraftGallery } from '@/components/media/AircraftGallery';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';
import './aircraft.css';

export const metadata: Metadata = {
  title: 'OE-LSC — Black Star',
  description: 'Meet OE-LSC, the SCK Aviation Gulfstream G450. Explore its matte-black exterior, custom cabin and award-winning design.',
};

export default function AircraftPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);

  return (
    <div className="aircraft-page-v2">
      <EditorialShell
        eyebrow="THE AIRCRAFT / OE-LSC"
        title={<>Black<br />Star.</>}
        intro="A Gulfstream G450 with a character of its own. Matte black outside. A carefully composed world within."
        image={{ src: '/images/sck-aircraft-hangar.webp', alt: 'The matte-black nose and cockpit of OE-LSC in the hangar' }}
        nextHref="/atelier"
        nextLabel="The transformation"
      >
        <PageSection index="01 / EXTERIOR & CABIN" title="Take a closer look.">
          <p>Move through Black Star from its unmistakable silhouette to the quieter details of the cabin.</p>
          <AircraftGallery assets={[
            { asset: asset('plane_img.webp'), label: 'OE-LSC above the runway' },
            { asset: asset('inplane_seats.webp'), label: 'The Black Star cabin' },
            { asset: asset('one_seat_view.webp'), label: 'A seat by the window' },
            { asset: asset('sck-galley.webp'), label: 'Portoro marble in the galley' },
            { asset: asset('colse_view_seat.webp'), label: 'Tailored cabin seating' },
            { asset: asset('sck-cabin-detail.webp'), label: 'The cabin in detail' },
            { asset: asset('sck-portoro-marble.webp'), label: 'Natural Portoro marble' },
            { asset: asset('sck-aircraft-flight.webp'), label: 'Black Star in flight' },
          ]} />
        </PageSection>

        <PageSection index="02 / THE DETAILS" title="Every detail belongs.">
          <p>Soft grey seating, dark surfaces and natural stone work as one composition. The contrast is deliberate, but never loud.</p>
          <div className="aircraft-detail-duo" aria-label="Black Star cabin details">
            <CinematicMedia asset={asset('inplane_seats.webp')} label="The complete Black Star cabin" eyebrow="THE CABIN" />
            <CinematicMedia asset={asset('colse_view_seat.webp')} label="Tailored cabin seating" eyebrow="TEXTURE" />
          </div>
          <p><a className="text-link" href="/design-philosophy">Explore the design language <span aria-hidden="true">→</span></a></p>
        </PageSection>

        <PageSection index="03 / MATERIAL CONTRAST" title="Soft. Then precise.">
          <p>Fabric and leather soften the space while Portoro marble and metal give it definition. Each material has a role in the whole.</p>
          <div className="aircraft-detail-duo aircraft-detail-duo-alt" aria-label="Black Star material details">
            <CinematicMedia asset={asset('sck-galley.webp')} label="Portoro marble and metal in the galley" eyebrow="THE GALLEY" />
            <CinematicMedia asset={asset('sck-portoro-marble.webp')} label="The natural pattern of Portoro marble" eyebrow="PORTORO" />
          </div>
          <p><a className="text-link" href="/atelier">Enter the atelier <span aria-hidden="true">→</span></a></p>
        </PageSection>

        <PageSection index="04 / RECOGNITION" title="Award-winning design.">
          <p>Black Star received the Private Jet Design award at the International Yacht &amp; Aviation Awards 2024.</p>
          <div className="aircraft-recognition-layout">
            <div className="aircraft-recognition-media">
              <CinematicMedia asset={asset('SCK-img-award.webp')} label="International Yacht & Aviation Awards, 2024" eyebrow="DESIGN EXCELLENCE" />
            </div>
            <div className="aircraft-recognition-proof">
              <span>WINNER / 2024</span>
              <strong>Private Jet Interior &amp; Exterior Design</strong>
              <p>A recognition of Black Star as a complete design statement — exterior, cabin and material language considered as one.</p>
              <a className="text-link" href="https://thedesignawards.co.uk/sck-aviation-gulfstream-g450/" target="_blank" rel="noreferrer">Discover the award <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </PageSection>
      </EditorialShell>
    </div>
  );
}
