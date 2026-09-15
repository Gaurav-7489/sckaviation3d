import type { Metadata } from 'next';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';

export const metadata: Metadata = {
  title: 'About / Sandra',
  description: 'Founder-led context for SCK Aviation and the creative worldview behind the aircraft and atelier.',
};

export default function AboutPage() {
  return (
    <EditorialShell
      eyebrow="ABOUT / SANDRA"
      title={<>A Creative<br />House.</>}
      intro="The founder layer is treated editorially: worldview first, biography second. The blueprint identifies Sandra Corinna Kinzl-Schuurman as the founder context behind SCK Aviation."
      nextHref="/access"
      nextLabel="Connect Selectively"
    >
      <PageSection index="01 / WORLDVIEW" title="One Point Of View">
        <p>SCK is framed as an aircraft transformation and lifestyle aviation house rather than a conventional charter brand. The site keeps founder context connected to design, projects and execution proof.</p>
      </PageSection>
      <PageSection index="02 / GOVERNANCE" title="Approved, Not Invented">
        <p>Founder quotes, detailed biography and personal references remain approval-sensitive content. The page is structurally ready for verified copy and an approved portrait without inventing missing material.</p>
      </PageSection>
    </EditorialShell>
  );
}
