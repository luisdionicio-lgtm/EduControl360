"use client";
import { useState } from "react";
export function GradeChart({
  items,
}: {
  items: { name: string; course: string; score: number }[];
}) {
  const [course, setCourse] = useState("");
  const filtered = items.filter((i) => !course || i.course === course);
  return (
    <section className="panel academic-chart">
      <div className="section-heading">
        <h2>Tu rendimiento académico</h2>
        <select
          aria-label="Filtrar gráfico por curso"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option value="">Todos los cursos</option>
          {[...new Set(items.map((i) => i.course))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="muted">Calificaciones publicadas · Escala de 0 a 20</p>
      <div className="chart-bars" role="list" aria-label="Calificaciones por evaluación">
        {filtered.map((item, i) => (
          <div
            role="listitem"
            className={"chart-column tone-" + (i % 3)}
            key={item.course + item.name}
          >
            <div className="chart-bar-area">
              <span
                className="chart-bar"
                style={{ transform: "scaleY(" + item.score / 20 + ")" }}
              />
              <strong>{item.score.toFixed(2)}</strong>
            </div>
            <span>{item.name}</span>
            <small>{item.course}</small>
          </div>
        ))}
      </div>
      {!filtered.length && <p>No hay notas publicadas.</p>}
    </section>
  );
}
