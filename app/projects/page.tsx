import type { Metadata } from 'next';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';
import { getPublicMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Projects / Productions',
  description: 'Selective charter, productions and special-project positioning from SCK Aviation.',
};

export default function ProjectsPage() {
  const media = getPublicMedia();
  const asset = (name: string) => media.find((item) => item.filename === name);

  return (
    <EditorialShell
      eyebrow="PROJECTS / PRODUCTIONS"
      title={<>Beyond<br />Aviation.</>}
      intro="The SCK world extends into productions, selective charter and cross-category special projects while keeping the aircraft and real media at the center."
      nextHref="/design-philosophy"
      nextLabel="View Design"
    >
      <PageSection index="01 / SELECTIVE" title="Access, Not Volume">
        <p>Selective charter is framed as part of the attitude rather than as a fleet marketplace. The available charter film carries the scene while the interface stays quiet.</p>
        <div className="page-wide-media">
          <CinematicMedia asset={asset('vid-charter-feature-v1.mp4')} label="Selective charter / project film" eyebrow="SELECTIVE / MOTION" controls />
        </div>
      </PageSection>

      <PageSection index="02 / PRODUCTIONS" title="A Wider Frame">
        <p>The page architecture is ready for approved production, film, fashion, automotive and private-project cases. Each case can carry media, credits, source status and a contextual next action.</p>
        <div className="material-library">
          <article className="material-card"><span>01 / CASE TYPE</span><h3>Productions</h3></article>
          <article className="material-card"><span>02 / CASE TYPE</span><h3>Automotive</h3></article>
          <article className="material-card"><span>03 / CASE TYPE</span><h3>Special Projects</h3></article>
        </div>
      </PageSection>

      <PageSection index="03 / ROUTING" title="No Dead Ends">
        <p>Project stories route directly to qualified access rather than generic contact. Credits and production references should only be published once SCK approves the exact wording and usage.</p>
      </PageSection>
    </EditorialShell>
  );
}
