'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <div>
        <p className="eyebrow">SYSTEM / RECOVERY</p>
        <h1>Details<br />Not Aligned.</h1>
        <p>The experience hit an unexpected state. Core navigation and content remain recoverable.</p>
        <button className="primary-link" type="button" onClick={reset}>Try again <span>→</span></button>
      </div>
    </main>
  );
}
