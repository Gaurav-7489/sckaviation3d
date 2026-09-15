import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page">
      <div>
        <p className="eyebrow">404 / DETAILS NOT ALIGNED</p>
        <h1>Off Course.</h1>
        <p>This route is not part of the current SCK experience.</p>
        <Link className="primary-link" href="/">Return to SCK <span>→</span></Link>
      </div>
    </main>
  );
}
