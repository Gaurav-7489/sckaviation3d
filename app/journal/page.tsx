import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialShell, PageSection } from '@/components/ui/EditorialShell';

export const metadata: Metadata = {
  title: 'Journal / Attitude',
  description: 'SCK Aviation editorial notes on material, process, projects and attitude.',
};

const stories = [
  { label: 'MATERIAL / FIELD NOTE', title: 'Black Is A Material', body: 'A short editorial route into surface, reflection and physical detail.', href: '/design-philosophy' },
  { label: 'PROCESS / FIELD NOTE', title: 'Proof Before Promise', body: 'Why transformation process belongs inside the story instead of behind it.', href: '/atelier' },
  { label: 'OBJECT / FIELD NOTE', title: 'Black Star', body: 'Exterior, interior and material read as one design object.', href: '/aircraft' },
];

export default function JournalPage() {
  return (
    <EditorialShell
      eyebrow="JOURNAL / ATTITUDE"
      title={<>Field<br />Notes.</>}
      intro="A deliberately simple editorial layer for approved behind-the-scenes stories, material choices, founder perspective, projects and press."
      nextHref="/about"
      nextLabel="About SCK"
    >
      <PageSection index="01 / EDITORIAL" title="One Story At A Time">
        <p>The journal stays useful only if SCK chooses to publish regularly. Until then, the site uses a light static framework rather than adding unnecessary CMS complexity.</p>
        <div className="journal-grid">
          {stories.map((story) => (
            <Link className="journal-card" href={story.href} key={story.title}>
              <span>{story.label}</span>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
            </Link>
          ))}
        </div>
      </PageSection>
    </EditorialShell>
  );
}
