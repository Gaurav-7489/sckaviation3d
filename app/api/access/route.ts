import { NextResponse } from 'next/server';

const fields = {
  projectType: { max: 80, label: 'service' },
  timeline: { max: 120, label: 'preferred timing' },
  company: { max: 160, label: 'company name' },
  name: { max: 160, label: 'full name' },
  email: { max: 240, label: 'email address' },
  phone: { max: 80, label: 'phone number' },
  reference: { max: 500, label: 'project reference' },
  message: { max: 4000, label: 'message' },
  consent: { max: 40, label: 'consent' },
} as const;

type Inquiry = Record<keyof typeof fields, string>;
const allowedProjectTypes = new Set(['Transformation', 'Selective Charter', 'Production', 'Collaboration']);
const maximumBodyBytes = 24000;

function invalid(message: string, field?: string) {
  return NextResponse.json({ ok: false, message, ...(field ? { field } : {}) }, { status: 400 });
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length')) > maximumBodyBytes) {
    return NextResponse.json({ ok: false, message: 'Your enquiry is too long. Please shorten your message and try again.' }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maximumBodyBytes) {
      return NextResponse.json({ ok: false, message: 'Your enquiry is too long. Please shorten your message and try again.' }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return invalid('We couldn’t read your enquiry. Please try again.');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return invalid('We couldn’t read your enquiry. Please try again.');
  }

  const input = body as Record<string, unknown>;
  const inquiry = {} as Inquiry;
  for (const [key, { max, label }] of Object.entries(fields)) {
    const value = input[key];
    if (value !== undefined && typeof value !== 'string') {
      return invalid(`Please check your ${label} and try again.`, key);
    }
    if (typeof value === 'string' && value.length > max) {
      return invalid(`Please keep your ${label} to ${max.toLocaleString('en')} characters or fewer.`, key);
    }
    inquiry[key as keyof Inquiry] = typeof value === 'string' ? value.trim() : '';
  }

  if (!inquiry.name) return invalid('Please enter your full name.', 'name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) return invalid('Please enter a valid email address.', 'email');
  if (!allowedProjectTypes.has(inquiry.projectType)) return invalid('Please select the service you’re interested in.', 'projectType');
  if (!inquiry.message) return invalid('Please tell us a little about your enquiry.', 'message');
  if (inquiry.consent !== 'accepted') return invalid('Please agree to being contacted about this enquiry.', 'consent');

  const destination = process.env.SCK_INQUIRY_WEBHOOK_URL;
  if (!destination) {
    return NextResponse.json(
      { ok: false, message: 'The enquiry form is temporarily unavailable. Please email sck@sckaviation.com using the link below.' },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(destination, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...inquiry, receivedAt: new Date().toISOString(), source: 'sckaviation.com' }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) throw new Error('Enquiry delivery was not confirmed.');
    return NextResponse.json({ ok: true, message: 'Thank you. Your enquiry has been received. Our team will be in touch by email.' });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'We couldn’t confirm your enquiry was received. Please try again or email sck@sckaviation.com using the link below.' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
