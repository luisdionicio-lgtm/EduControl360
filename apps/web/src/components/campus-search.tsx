"use client";
import { useState, useId } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
export function CampusSearch({ institutionId }: { institutionId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; href: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!institutionId || query.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/backend/institutions/" + institutionId + "/student");
      if (!response.ok) throw new Error();
      const data = await response.json();
      const q = query.toLocaleLowerCase("es");
      const courses = (data.student?.enrollments ?? []) as {
        section: {
          id: string;
          course: { name: string; code: string };
          evaluations: { name: string }[];
        };
      }[];
      setResults(
        courses
          .filter((e) =>
            (
              e.section.course.name +
              " " +
              e.section.course.code +
              " " +
              e.section.evaluations.map((v) => v.name).join(" ")
            )
              .toLocaleLowerCase("es")
              .includes(q),
          )
          .map((e) => ({
            label: e.section.course.name + " · " + e.section.course.code,
            href: "/campus/courses?institution=" + institutionId + "#course-" + e.section.id,
          })),
      );
      if (!courses.length)
        setError(
          "No hay cursos vinculados a esta cuenta. En gestión académica encontrarás los registros institucionales.",
        );
    } catch {
      setError("No se pudo buscar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="campus-search">
      <form onSubmit={(e) => void search(e)} role="search">
        <Search size={17} />
        <input
          aria-label="Buscar cursos y evaluaciones"
          placeholder="Buscar cursos y evaluaciones…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          minLength={2}
          maxLength={120}
        />
        <button type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>
      {(results.length > 0 || error) && (
        <section className="search-results" aria-label="Resultados de búsqueda" id={id}>
          <button
            className="search-close"
            aria-label="Cerrar búsqueda"
            onClick={() => {
              setResults([]);
              setError("");
            }}
          >
            <X size={16} />
          </button>
          {error ? (
            <p role="status">{error}</p>
          ) : (
            results.map((r) => (
              <Link key={r.href} href={r.href} onClick={() => setResults([])}>
                {r.label}
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}
