'use client';

import { FormEvent, useState } from 'react';

type State = 'idle' | 'sending' | 'success' | 'error';

export function AccessForm() {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setState('sending');
    setMessage('');

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || 'Details not aligned. Please refine.');
      setState('success');
      setMessage(result.message || 'Request received.');
      form.reset();
      window.dispatchEvent(new CustomEvent('sck:analytics', { detail: { event: 'access_submit_success' } }));
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Details not aligned. Please refine.');
      window.dispatchEvent(new CustomEvent('sck:analytics', { detail: { event: 'access_submit_error' } }));
    }
  }

  return (
    <form className="access-form" onSubmit={submit} noValidate={false}>
      <div className="form-field form-field-wide">
        <label htmlFor="projectType">Project type</label>
        <select id="projectType" name="projectType" required defaultValue="">
          <option value="" disabled>Select intent</option>
          <option>Transformation</option>
          <option>Selective Charter</option>
          <option>Production</option>
          <option>Collaboration</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="timeline">Timeline / target date</label>
        <input id="timeline" name="timeline" type="text" autoComplete="off" placeholder="When should this move?" required />
      </div>
      <div className="form-field">
        <label htmlFor="company">Company <span>optional</span></label>
        <input id="company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor="reference">Reference / context</label>
        <input id="reference" name="reference" type="text" placeholder="Aircraft, production, visual reference or project context" />
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor="message">Message / project context</label>
        <textarea id="message" name="message" rows={5} required />
      </div>
      <label className="consent form-field-wide">
        <input type="checkbox" name="consent" value="accepted" required />
        <span>I acknowledge that my details may be used to respond to this inquiry.</span>
      </label>
      <div className="form-submit form-field-wide">
        <button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'ALIGNING REQUEST…' : 'REQUEST ACCESS'} <span aria-hidden="true">↗</span>
        </button>
        <p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p>
      </div>
    </form>
  );
}
