'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import '@/app/enquiry.css';

type State = 'idle' | 'draft' | 'sending' | 'success' | 'error';
type ResponseBody = { ok?: boolean; message?: string };

export function AccessForm({ delivery = 'email' }: { delivery?: 'email' | 'webhook' }) {
  const id = useId();
  const sending = useRef(false);
  const serviceField = useRef<HTMLSelectElement>(null);
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const [emailDraft, setEmailDraft] = useState('');

  useEffect(() => {
    const interest = new URLSearchParams(window.location.search).get('interest');
    const field = serviceField.current;
    if (field && interest && Array.from(field.options).some((option) => option.value === interest)) {
      field.value = interest;
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    for (const name of ['name', 'email', 'message']) {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      field.setCustomValidity(typeof data[name] === 'string' && data[name].trim() ? '' : 'Please complete this field.');
    }
    if (!form.reportValidity()) return;

    if (delivery === 'email') {
      const detail = (name: string) => typeof data[name] === 'string' ? data[name].trim() : '';
      const selectedService = serviceField.current?.selectedOptions[0]?.text || detail('projectType');
      const body = [
        'Hello SCK Aviation,',
        '',
        detail('message'),
        '',
        `Service: ${selectedService}`,
        `Name: ${detail('name')}`,
        `Email: ${detail('email')}`,
        ...(detail('company') ? [`Company: ${detail('company')}`] : []),
        ...(detail('phone') ? [`Phone: ${detail('phone')}`] : []),
        ...(detail('timeline') ? [`Preferred timing: ${detail('timeline')}`] : []),
        '',
        'I agree that SCK Aviation may use these details to respond to my enquiry.',
      ].join('\n');
      const draft = `mailto:sck@sckaviation.com?subject=${encodeURIComponent(`SCK Aviation enquiry — ${selectedService}`)}&body=${encodeURIComponent(body)}`;
      setEmailDraft(draft);
      setState('draft');
      setMessage('Your email draft is ready. Send it from your email app to complete your enquiry.');
      window.location.href = draft;
      return;
    }

    sending.current = true;
    setState('sending');
    setMessage('Sending your enquiry…');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null) as ResponseBody | null;
      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.message || 'We couldn’t confirm your enquiry was received. Please try again or email us below.');
      }

      setState('success');
      setMessage(result.message || 'Thank you. Your enquiry has been received. Our team will be in touch by email.');
      form.reset();
      window.dispatchEvent(new CustomEvent('sck:analytics', { detail: { event: 'access_submit_success' } }));
    } catch (error) {
      setState('error');
      setMessage(controller.signal.aborted
        ? 'This is taking longer than expected. We couldn’t confirm delivery. Please email us below.'
        : error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : 'We couldn’t connect. Please check your connection, try again, or email us below.');
      window.dispatchEvent(new CustomEvent('sck:analytics', { detail: { event: 'access_submit_error' } }));
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
    }
  }

  return (
    <form className="access-form" onSubmit={submit} aria-label="Contact SCK Aviation" aria-busy={state === 'sending'}>
      <p className="enquiry-guidance">{delivery === 'email' ? 'Complete your details, then send your enquiry from your email app.' : 'Tell us a little about your plans.'} Fields marked * are required.</p>

      <fieldset className="enquiry-section" disabled={state === 'sending'}>
        <legend>Your details</legend>
        <div className="enquiry-fields">
          <div className="enquiry-field">
            <label htmlFor={`${id}-name`}>Full name <span aria-hidden="true">*</span></label>
            <input id={`${id}-name`} name="name" type="text" autoComplete="name" placeholder="Your full name" maxLength={160} required onInput={(event) => event.currentTarget.setCustomValidity('')} />
          </div>
          <div className="enquiry-field">
            <label htmlFor={`${id}-email`}>Email address <span aria-hidden="true">*</span></label>
            <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={240} required onInput={(event) => event.currentTarget.setCustomValidity('')} />
          </div>
          <div className="enquiry-field">
            <label htmlFor={`${id}-company`}>Company <span>(optional)</span></label>
            <input id={`${id}-company`} name="company" type="text" autoComplete="organization" placeholder="Company or organisation" maxLength={160} />
          </div>
          <div className="enquiry-field">
            <label htmlFor={`${id}-phone`}>Phone <span>(optional)</span></label>
            <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="Include your country code" maxLength={80} />
          </div>
        </div>
      </fieldset>

      <fieldset className="enquiry-section" disabled={state === 'sending'}>
        <legend>Your enquiry</legend>
        <div className="enquiry-fields">
          <div className="enquiry-field">
            <label htmlFor={`${id}-projectType`}>I’m interested in <span aria-hidden="true">*</span></label>
            <select ref={serviceField} id={`${id}-projectType`} name="projectType" required defaultValue="">
              <option value="" disabled>Select a service</option>
              <option value="Transformation">Aircraft design & transformation</option>
              <option value="Selective Charter">Private charter</option>
              <option value="Production">Film & production</option>
              <option value="Collaboration">Partnerships & collaboration</option>
            </select>
          </div>
          <div className="enquiry-field">
            <label htmlFor={`${id}-timeline`}>Preferred timing <span>(optional)</span></label>
            <input id={`${id}-timeline`} name="timeline" type="text" placeholder="A date, month, or still exploring" maxLength={120} />
          </div>
          <div className="enquiry-field enquiry-field-wide">
            <label htmlFor={`${id}-message`}>How can we help? <span aria-hidden="true">*</span></label>
            <textarea id={`${id}-message`} name="message" rows={4} placeholder="Tell us about your project, journey, or idea." maxLength={4000} required aria-describedby={`${id}-message-help`} onInput={(event) => event.currentTarget.setCustomValidity('')} />
            <p id={`${id}-message-help`} className="enquiry-field-help">A few details are enough to start the conversation.</p>
          </div>
        </div>
      </fieldset>

      <div className="enquiry-consent">
        <input id={`${id}-consent`} type="checkbox" name="consent" value="accepted" required disabled={state === 'sending'} aria-describedby={`${id}-privacy`} />
        <div>
          <label htmlFor={`${id}-consent`}>I agree that SCK Aviation may use my details to respond to this enquiry. <span aria-hidden="true">*</span></label>
          <a id={`${id}-privacy`} href="https://sckaviation.com/privacy" target="_blank" rel="noopener noreferrer">Read our privacy policy <span className="enquiry-sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className="enquiry-submit">
        <button type="submit" disabled={state === 'sending'}>
          {delivery === 'email' ? 'Continue in email' : state === 'sending' ? 'Sending enquiry…' : state === 'error' ? 'Try again' : 'Send enquiry'} <span aria-hidden="true">↗</span>
        </button>
        <p className={`enquiry-status enquiry-status-${state}`} role="status" aria-live="polite" aria-atomic="true">{message}</p>
        {emailDraft && <p className="enquiry-email">Email app didn’t open? <a href={emailDraft}>Open your email draft <span aria-hidden="true">↗</span></a></p>}
        <p className="enquiry-email">Prefer email? <a href="mailto:sck@sckaviation.com">sck@sckaviation.com <span aria-hidden="true">↗</span></a></p>
      </div>
    </form>
  );
}
