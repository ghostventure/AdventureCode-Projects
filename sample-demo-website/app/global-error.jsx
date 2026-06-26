"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <main className="route-page">
          <section className="route-panel danger-card">
            <p className="eyebrow">Global error</p>
            <h1>Application recovery state.</h1>
            <p>{error?.message || "The application hit an unexpected error."}</p>
            <button type="button" onClick={() => reset()}>Reload</button>
          </section>
        </main>
      </body>
    </html>
  );
}
