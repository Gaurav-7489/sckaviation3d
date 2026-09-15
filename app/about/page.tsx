import type { Metadata } from 'next';
import Link from 'next/link';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'About SCK Aviation',
  description: 'Meet the creative vision behind SCK Aviation, founded by Sandra Corinna Kinzl-Schuurman.',
};

export default function AboutPage() {
  const media = getPublicMedia();
  return (
    <EditorialShell
      eyebrow="ABOUT SCK AVIATION"
      title={<>A singular<br />vision.</>}
      intro="Founded by Sandra Corinna Kinzl-Schuurman, SCK Aviation brings a personal point of view to aircraft design, travel and film."
      image={{ src: '/images/sandra-corinna-kinzl.webp', alt: 'Sandra Corinna Kinzl beside the entrance to OE-LSC' }}
      nextHref="/access"
      nextLabel="Get in touch"
    >
      <PageSection index="01 / OUR POINT OF VIEW" title="Made to stand apart.">
        <p>Black Star expresses a simple belief: an aircraft can be as individual as the person behind it. From its matte-black exterior to its smallest cabin detail, OE-LSC carries that belief through.</p>
        <div className="page-wide-media"><CinematicMedia asset={media.find((item) => item.filename === 'inplane_seats.webp')} label="Inside OE-LSC" /></div>
      </PageSection>
      <PageSection index="02 / OUR WORLD" title="Beyond the journey.">
        <p>Our world includes selected private travel, productions and special projects. It begins with a shared idea and a conversation.</p>
        <Link href="/projects" className="text-link">Explore our projects <span aria-hidden="true">→</span></Link>
      </PageSection>
    </EditorialShell>
  );
}
