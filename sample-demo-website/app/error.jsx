"use client";

export default function GlobalRouteError({ error, reset }) {
  return (
    <main className="route-page">
      <section className="route-panel danger-card">
        <p className="eyebrow">Error boundary</p>
        <h1>Something needs review.</h1>
        <p>{error?.message || "The route failed to load."}</p>
        <button type="button" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
