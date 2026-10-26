import type { AcademicData } from "./management";
import { BookOpen, ChevronDown } from "lucide-react";
export function ManagementOverview({ data, role }: { data: AcademicData; role: string }) {
  const students = new Set(data.sections.flatMap((s) => s.enrollments.map((e) => e.student.code)));
  return (
    <>
      <dl className="management-overview">
        <div>
          <dt>{role === "ADMIN" ? "Programas registrados" : "Secciones asignadas"}</dt>
          <dd>{role === "ADMIN" ? data.programs.length : data.sections.length}</dd>
        </div>
        <div>
          <dt>Cursos activos</dt>
          <dd>{new Set(data.sections.map((s) => s.course.name)).size}</dd>
        </div>
        <div>
          <dt>{role === "ADMIN" ? "Estudiantes registrados" : "Estudiantes en tus secciones"}</dt>
          <dd>{role === "ADMIN" ? data.students.length : students.size}</dd>
        </div>
        <div>
          <dt>Evaluaciones creadas</dt>
          <dd>{data.sections.reduce((sum, s) => sum + s.evaluations.length, 0)}</dd>
        </div>
      </dl>
      <details className="registry">
        <summary>
          <span>
            <BookOpen size={16} /> Registros actuales · {data.sections.length} secciones
          </span>
          <ChevronDown size={16} />
        </summary>
        <div className="registry-content">
          {role === "ADMIN" && (
            <>
              <h3>Programas y cursos</h3>
              <ul className="program-list">
                {data.programs.map((p) => (
                  <li key={p.id}>
                    {p.name} · {p.courses.length} cursos
                  </li>
                ))}
              </ul>
              {!data.programs.length && (
                <p className="muted">Crea tu primer programa en estructura académica.</p>
              )}
            </>
          )}
          <div className="table-wrap" role="region" aria-label="Secciones registradas" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Curso / sección</th>
                  <th>Período</th>
                  <th>Matrículas</th>
                  <th>Evaluaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.sections.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Curso / sección">
                      <strong>{s.course.name}</strong>
                      <div className="muted">{s.name}</div>
                    </td>
                    <td data-label="Período">{s.period.name}</td>
                    <td data-label="Matrículas">{s.enrollments.length}</td>
                    <td data-label="Evaluaciones">{s.evaluations.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </>
  );
}
