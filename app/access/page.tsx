import type { Metadata } from 'next';
import { AccessForm } from '@/components/ui/AccessForm';
import { EditorialShell } from '@/components/ui/EditorialShell';

export const metadata: Metadata = {
  title: 'Make an Enquiry',
  description: 'Talk to SCK Aviation about aircraft design, private charter, film production, or a new collaboration.',
};

export default function AccessPage() {
  return (
    <div className="enquiry-page">
      <EditorialShell
        eyebrow="CONTACT SCK AVIATION"
        title={<>Let’s talk.</>}
        intro="A private journey. A new aircraft interior. A scene only this aircraft could make. Tell us what you have in mind."
        nextHref="/aircraft"
        nextLabel="Explore the aircraft"
      >
        <section className="enquiry-layout" aria-labelledby="enquiry-heading">
          <div className="enquiry-intro">
            <p className="eyebrow">START A CONVERSATION</p>
            <h2 id="enquiry-heading">Your next<br />chapter.</h2>
            <p>Share your plans with our team. Complete the form to prepare an email, or contact us directly below.</p>
            <div className="enquiry-contact">
              <span>Contact us directly</span>
              <a href="mailto:sck@sckaviation.com">sck@sckaviation.com <span aria-hidden="true">↗</span></a>
              <p>Based in Vienna.<br />Working wherever your project takes us.</p>
            </div>
          </div>
          <AccessForm />
        </section>
      </EditorialShell>
    </div>
  );
}
