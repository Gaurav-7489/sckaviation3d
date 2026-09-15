import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Atelier / Transformation',
  description: 'The SCK Aviation transformation story: process, execution and proof arranged as an editorial timeline.',
};

const steps = [
  ['01', 'Arrival', 'The object enters the story before the finish does.'],
  ['02', 'Strip', 'Remove what no longer belongs; expose the system underneath.'],
  ['03', 'Structure', 'Complexity becomes visible before it becomes controlled.'],
  ['04', 'Paint', 'Surface, preparation and alignment determine the final read.'],
  ['05', 'Manufacture', 'Material choices and custom details resolve into one language.'],
  ['06', 'Completion', 'The finished aircraft becomes proof of the process rather than a separate claim.'],
] as const;

export default function AtelierPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);

  return (
    <EditorialShell
      eyebrow="ATELIER / TRANSFORMATION"
      title={<>Mission<br />Impossible.</>}
      intro="The blueprint treats process as trust: arrival, removal, structure, paint, manufacture and completion become a chaptered narrative instead of hidden back-of-house work."
      nextHref="/projects"
      nextLabel="View Projects"
    >
      <PageSection index="01 / PROCESS" title="Proof, In Sequence">
        <p>Every step is designed to support media, credits and source approval without turning the page into a technical report.</p>
        <div className="numbered-timeline">
          {steps.map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span><h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection index="02 / MOTION" title="Process On Film">
        <p>The available production/process footage is used as one cinematic chapter with lazy playback, not as decorative background noise.</p>
        <div className="page-wide-media">
          <CinematicMedia asset={asset('vid-mi-opt-v1.mp4')} label="Transformation / production film" eyebrow="PROCESS / MOTION" controls />
        </div>
      </PageSection>

      <PageSection index="03 / CABIN" title="Material Becomes Method">
        <p>Interior media is positioned as evidence of decisions and finish quality. Captions remain editable so approved credits and sourcing can be added later.</p>
        <div className="page-media-pair">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Cabin detail" eyebrow="DETAIL / 01" />
          <CinematicMedia asset={asset('inplane_seats.webp')} label="Cabin system" eyebrow="DETAIL / 02" />
        </div>
      </PageSection>
    </EditorialShell>
  );
}
