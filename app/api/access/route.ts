import { NextResponse } from 'next/server';

type Inquiry = {
  projectType?: string;
  timeline?: string;
  company?: string;
  name?: string;
  email?: string;
  reference?: string;
  message?: string;
  consent?: string;
};

const allowedProjectTypes = new Set(['Transformation', 'Selective Charter', 'Production', 'Collaboration']);

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: Inquiry;
  try {
    body = await request.json() as Inquiry;
  } catch {
    return NextResponse.json({ ok: false, message: 'Details not aligned. Please refine.' }, { status: 400 });
  }

  const inquiry = {
    projectType: text(body.projectType, 80),
    timeline: text(body.timeline, 120),
    company: text(body.company, 160),
    name: text(body.name, 160),
    email: text(body.email, 240),
    reference: text(body.reference, 500),
    message: text(body.message, 4000),
    consent: text(body.consent, 40),
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email);
  if (!allowedProjectTypes.has(inquiry.projectType) || !inquiry.timeline || !inquiry.name || !emailValid || !inquiry.message || inquiry.consent !== 'accepted') {
    return NextResponse.json({ ok: false, message: 'Details not aligned. Please refine.' }, { status: 400 });
  }

  const destination = process.env.SCK_INQUIRY_WEBHOOK_URL;
  if (!destination) {
    return NextResponse.json(
      { ok: false, message: 'Inquiry routing is awaiting final SCK approval. Please try again once the destination is configured.' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(destination, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...inquiry, receivedAt: new Date().toISOString(), source: 'sckaviation.com' }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Destination returned ${response.status}`);
    return NextResponse.json({ ok: true, message: 'Request received. We will respond selectively.' });
  } catch {
    return NextResponse.json({ ok: false, message: 'The request could not be routed. Please try again.' }, { status: 502 });
  }
}
