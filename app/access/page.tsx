import type { Metadata } from 'next';
import { AccessForm } from '@/components/ui/AccessForm';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';

export const metadata: Metadata = {
  title: 'Request Access',
  description: 'Qualified inquiry for aircraft transformation, selective charter, production and collaboration.',
};

export default function AccessPage() {
  return (
    <EditorialShell
      eyebrow="ACCESS / INQUIRY"
      title={<>Selectively.</>}
      intro="Conversion should feel like entering a selective relationship, not submitting a generic quote request. Only project-relevant context is requested."
      nextHref="/aircraft"
      nextLabel="Explore Black Star"
    >
      <PageSection index="01 / REQUEST" title="Tell Us The Intent">
        <p>Choose transformation, selective charter, production or collaboration. Operational fields such as passenger count or budget are intentionally excluded until the project type actually requires them.</p>
        <AccessForm />
      </PageSection>
      <PageSection index="02 / ROUTING" title="Built For Approval">
        <p>The form endpoint validates input and is ready to route to an approved CRM or secure webhook. Until SCK confirms that destination and final privacy language, the live route returns a clear recoverable state rather than silently sending data somewhere unapproved.</p>
      </PageSection>
    </EditorialShell>
  );
}
