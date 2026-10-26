"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="workspace">
      <section className="panel">
        <h1>No pudimos cargar esta página.</h1>
        <p>
          Revisa tu conexión e inténtalo de nuevo. Si el problema continúa, contacta a tu
          institución.
        </p>
        <button className="button" onClick={reset}>
          Reintentar
        </button>
      </section>
    </main>
  );
}
