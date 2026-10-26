import Link from "next/link";
import { BookOpen, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import { CampusShell } from "@/components/campus-shell";
import { Onboarding } from "@/components/onboarding";
import { campusContext, studentData } from "@/lib/campus";
import { notFound } from "next/navigation";
import { StudentDashboard } from "@/components/student-dashboard";
import { isDemoEnabled } from "@/lib/demo";
const days = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const statuses: Record<string, string> = {
  PRESENT: "Presente",
  LATE: "Tardanza",
  ABSENT: "Ausente",
  EXCUSED: "Justificada",
};
const titles: Record<string, string> = {
  home: "Tu aprendizaje, en un solo lugar.",
  courses: "Mis cursos",
  grades: "Mis notas",
  attendance: "Mi asistencia",
  schedule: "Mi horario",
  account: "Mi cuenta",
};
export const dynamic = "force-dynamic";
export default async function Campus({
  params,
  searchParams,
}: {
  params: Promise<{ view?: string[] }>;
  searchParams: Promise<{ institution?: string }>;
}) {
  const { view } = await params;
  const route = view?.[0] ?? "home";
  if ((view && view.length > 1) || !titles[route]) notFound();
  const { institution } = await searchParams;
  const { me, institutionId } = await campusContext(institution);
  const data = institutionId ? await studentData(institutionId) : { student: null };
  const student = data.student;
  const enrollments = student?.enrollments ?? [];
  const suffix = "?institution=" + institutionId;
  const active = route === "home" ? "/campus" : "/campus/" + route;
  const grades = enrollments.flatMap((e) =>
    e.grades.map((g) => ({ ...g, course: e.section.course.name, code: e.section.course.code })),
  );
  if (route === "home" && student && enrollments.length)
    return (
      <CampusShell me={me} active={active} institutionId={institutionId}>
        <div className="intro">
          <div>
            <h1>
              Hola, {me.name.split(" ")[0]}
              <span className="heading-dot">.</span>
            </h1>
            <p>Un buen día para seguir construyendo tu futuro.</p>
          </div>
          <span className="semester-label">
            {enrollments[0].section.period.name}
            <span>Período académico</span>
          </span>
        </div>
        <StudentDashboard student={student} institutionId={institutionId!} />
      </CampusShell>
    );
  return (
    <CampusShell me={me} active={active} institutionId={institutionId}>
      <div className="intro">
        <div>
          <h1>{titles[route]}</h1>
          <p>
            {route === "home"
              ? "Tu institución, tus cursos y cada paso que das."
              : route === "grades"
                ? "Solo se muestran las calificaciones publicadas por tu docente."
                : "Información conectada a tu institución."}
          </p>
        </div>
        {student && <span className="badge">Código {student.code}</span>}
      </div>
      {!institutionId ? (
        <Onboarding />
      ) : route === "account" ? (
        <section className="panel">
          <h2>Identidad y acceso</h2>
          <dl>
            <dt>Nombre</dt>
            <dd>{me.name}</dd>
            <dt>
              {isDemoEnabled() ? "Correo ficticio de demostración" : "Correo verificado por Google"}
            </dt>
            <dd>{me.email}</dd>
            <dt>Instituciones vinculadas</dt>
            <dd>{me.memberships.length}</dd>
          </dl>
          <p className="muted">
            Cerrar sesión revoca la sesión actual en el servidor. Los cambios de membresía se
            aplican en cada petición.
          </p>
        </section>
      ) : !student || !enrollments.length ? (
        <section className="panel">
          <div className="empty">
            <BookOpen size={32} />
            <h2>Tu siguiente etapa está por comenzar.</h2>
            <p>
              Todavía no tienes matrículas vinculadas a esta cuenta. Contacta a la administración de
              tu institución para registrar tu matrícula y confirmar tu correo.
            </p>
          </div>
        </section>
      ) : (
        <>
          {(route === "home" || route === "courses") && (
            <section className="panel">
              <div className="section-heading">
                <h2>{route === "home" ? "Tus cursos, a un vistazo" : "Cursos matriculados"}</h2>
                {route === "home" && (
                  <Link href={"/campus/courses" + suffix}>
                    Ver todos <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
              <div
                className="table-wrap"
                role="region"
                aria-label="Cursos matriculados"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Curso</th>
                      <th>Sección / período</th>
                      <th>Créditos</th>
                      <th>Evaluaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id}>
                        <td data-label="Curso">
                          <strong>{e.section.course.name}</strong>
                          <div className="muted">{e.section.course.code}</div>
                        </td>
                        <td data-label="Sección / período">
                          {e.section.name}
                          <div className="muted">{e.section.period.name}</div>
                        </td>
                        <td data-label="Créditos">{e.section.course.credits}</td>
                        <td data-label="Evaluaciones">
                          {e.grades.length} publicadas de {e.section.evaluations.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {(route === "home" || route === "grades") && (
            <section className="panel">
              <div className="section-heading">
                <h2>Calificaciones publicadas</h2>
                <ShieldCheck size={20} className="ok" />
              </div>
              {grades.length ? (
                <div
                  className="table-wrap"
                  role="region"
                  aria-label="Calificaciones publicadas"
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Evaluación / curso</th>
                        <th>Peso</th>
                        <th>Nota sobre 20</th>
                        <th>Publicación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((g) => (
                        <tr key={g.id}>
                          <td data-label="Evaluación / curso">
                            <strong>{g.evaluation.name}</strong>
                            <div className="muted">{g.course}</div>
                          </td>
                          <td data-label="Peso">{g.evaluation.weight}%</td>
                          <td className="grade" data-label="Nota sobre 20">
                            {Number(g.score).toFixed(2)}
                          </td>
                          <td data-label="Publicación">
                            {new Date(g.publishedAt).toLocaleDateString("es-PE", {
                              timeZone: "America/Lima",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty">Tus docentes todavía no publicaron notas.</p>
              )}
              <p className="muted">
                Escala de calificación: 0 a 20. Solo se muestran las notas publicadas por tu
                docente.
              </p>
            </section>
          )}
          {route === "courses" && (
            <div className="course-detail-grid">
              {enrollments.map((e) => (
                <section id={"course-" + e.section.id} className="panel course-detail" key={e.id}>
                  <div className="section-heading">
                    <h2>{e.section.course.name}</h2>
                    <span className="badge">{e.section.course.code}</span>
                  </div>
                  <p className="muted">
                    {e.section.teacher?.name ?? "Docente por asignar"} · {e.section.name} ·{" "}
                    {e.section.course.credits} créditos
                  </p>
                  <h3>Evaluaciones del curso</h3>
                  <ul className="evaluation-list">
                    {e.section.evaluations.map((v) => {
                      const grade = e.grades.find((g) => g.evaluation.id === v.id);
                      return (
                        <li key={v.id}>
                          <div>
                            <strong>{v.name}</strong>
                            <small>
                              {new Date(v.dueAt).toLocaleDateString("es-PE", {
                                timeZone: "America/Lima",
                              })}{" "}
                              · Peso {v.weight}%
                            </small>
                          </div>
                          <span className={grade ? "score-tag" : "pending-tag"}>
                            {grade ? Number(grade.score).toFixed(2) : "Por publicar"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
          {route === "attendance" && (
            <section className="panel">
              <h2>Registro por curso</h2>
              <div className="table-wrap" role="region" aria-label="Asistencia" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th>Curso</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.flatMap((e) =>
                      e.attendance.map((a) => (
                        <tr key={a.id}>
                          <td data-label="Curso">{e.section.course.name}</td>
                          <td data-label="Fecha">{a.date.slice(0, 10)}</td>
                          <td data-label="Estado">{statuses[a.status]}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
              {!enrollments.some((e) => e.attendance.length > 0) && (
                <p className="empty">Aún no hay registros de asistencia.</p>
              )}
            </section>
          )}
          {route === "schedule" && (
            <section className="panel">
              <CalendarDays size={24} />
              <h2>Tu semana académica</h2>
              <div className="table-wrap" role="region" aria-label="Horario semanal" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Horario</th>
                      <th>Curso</th>
                      <th>Aula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments
                      .flatMap((e) =>
                        e.section.schedules.map((s) => ({ ...s, course: e.section.course.name })),
                      )
                      .sort(
                        (a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime),
                      )
                      .map((s) => (
                        <tr key={s.id}>
                          <td data-label="Día">{days[s.weekday]}</td>
                          <td data-label="Horario">
                            {s.startTime}–{s.endTime}
                          </td>
                          <td data-label="Curso">{s.course}</td>
                          <td data-label="Aula">{s.room}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!enrollments.some((e) => e.section.schedules.length) && (
                <p className="empty">Tu institución todavía no ha registrado horarios.</p>
              )}
            </section>
          )}
        </>
      )}
    </CampusShell>
  );
}
