import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Code2,
  Layers3,
  Database,
  CalendarClock,
  CheckCheck,
  GraduationCap,
} from "lucide-react";
import type { StudentData } from "@/lib/campus";
import {
  partialAverage,
  creditWeightedAverage,
  attendanceRate,
  limaCalendar,
} from "@/lib/academic-metrics";
import { WeekAgenda } from "./week-agenda";
type Student = NonNullable<StudentData["student"]>;
export function StudentDashboard({
  student,
  institutionId,
}: {
  student: Student;
  institutionId: string;
}) {
  const suffix = "?institution=" + institutionId;
  const enrollments = student.enrollments;
  const calendar = limaCalendar();
  const schedules = enrollments.flatMap((e) =>
    e.section.schedules.map((s) => ({ ...s, course: e.section.course.name })),
  );
  const nowTime = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const next = [...schedules].sort((a, b) => {
    const distance = (s: typeof a) =>
      ((s.weekday - calendar.weekday + 7) % 7) +
      (s.weekday === calendar.weekday && s.endTime <= nowTime ? 7 : 0);
    return distance(a) - distance(b) || a.startTime.localeCompare(b.startTime);
  })[0];
  const nextDate = next ? new Date(calendar.date) : null;
  if (next && nextDate) {
    let d = (next.weekday - calendar.weekday + 7) % 7;
    if (d === 0 && next.endTime <= nowTime) d = 7;
    nextDate.setUTCDate(nextDate.getUTCDate() + d);
  }
  const allGrades = enrollments.flatMap((e) =>
    e.grades.map((g) => ({ ...g, course: e.section.course.name })),
  );
  const latest = [...allGrades]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  const average = creditWeightedAverage(
    enrollments.map((e) => ({ credits: e.section.course.credits, grades: e.grades })),
  );
  const attendance = enrollments.flatMap((e) => e.attendance);
  const rate = attendanceRate(attendance);
  const published = new Set(allGrades.map((g) => g.evaluation.id));
  const upcoming = enrollments
    .flatMap((e) =>
      e.section.evaluations
        .filter((v) => !published.has(v.id))
        .map((v) => ({ ...v, course: e.section.course.name })),
    )
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 3);
  const icons = [Code2, Layers3, Database];
  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="study-feature">
          <div className="feature-copy">
            <h2>{next ? next.course : "Tu próximo capítulo comienza aquí."}</h2>
            <p>
              {next
                ? "Tu próxima clase. Un nuevo espacio para construir lo que sabes."
                : "Revisa tus cursos y sigue construyendo tu camino académico."}
            </p>
            <Link className="button dark-button" href={"/campus/schedule" + suffix}>
              Ver mi horario <ArrowUpRight size={17} />
            </Link>
            <div className="feature-meta">
              <GraduationCap size={16} />
              <span>{enrollments[0]?.section.course.program?.name ?? "Mi programa académico"}</span>
              <span>{enrollments[0]?.section.period.name}</span>
            </div>
          </div>
          <div className="feature-date">
            {nextDate ? (
              <>
                <span>
                  {nextDate.toLocaleDateString("es-PE", {
                    weekday: "long",
                    timeZone: "America/Lima",
                  })}
                </span>
                <strong>{nextDate.getUTCDate()}</strong>
                <span>
                  {nextDate.toLocaleDateString("es-PE", {
                    month: "long",
                    timeZone: "America/Lima",
                  })}
                </span>
                <b>
                  {next?.startTime}—{next?.endTime}
                </b>
              </>
            ) : (
              <BookOpen size={54} />
            )}
          </div>
        </section>
        <dl className="academic-strip">
          <div>
            <dt>Cursos en marcha</dt>
            <dd>
              {enrollments.length}
              <BookOpen size={18} />
            </dd>
          </div>
          <div>
            <dt>Créditos matriculados</dt>
            <dd>
              {enrollments.reduce((sum, e) => sum + e.section.course.credits, 0)}
              <Layers3 size={18} />
            </dd>
          </div>
          <div>
            <dt>Notas publicadas</dt>
            <dd>
              {allGrades.length}
              <CheckCheck size={18} />
            </dd>
          </div>
        </dl>
        <section className="courses-section">
          <div className="section-heading">
            <h2>
              Tus cursos <span className="count">{enrollments.length}</span>
            </h2>
            <Link className="text-link" href={"/campus/courses" + suffix}>
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="course-grid">
            {enrollments.slice(0, 3).map((e, index) => {
              const Icon = icons[index % 3];
              return (
                <Link
                  key={e.id}
                  className={"course-card tone-" + (index % 3)}
                  href={"/campus/courses" + suffix + "#course-" + e.section.id}
                >
                  <div className="course-top">
                    <span className="course-icon">
                      <Icon size={23} />
                    </span>
                    <span className="course-code">{e.section.course.code}</span>
                    <ArrowUpRight size={17} />
                  </div>
                  <h3>{e.section.course.name}</h3>
                  <p>{e.section.teacher?.name ?? "Docente por asignar"}</p>
                  <div className="course-progress-label">
                    <span>Evaluaciones publicadas</span>
                    <strong>
                      {e.grades.length}/{e.section.evaluations.length}
                    </strong>
                  </div>
                  <progress
                    value={e.grades.length}
                    max={Math.max(1, e.section.evaluations.length)}
                    aria-label={"Evaluaciones publicadas de " + e.section.course.name}
                  />
                  <footer>
                    <span>{e.section.course.credits} créditos</span>
                    <span>{e.section.name}</span>
                  </footer>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="recent-grades">
          <div className="section-heading">
            <h2>Lo último en tus notas</h2>
            <Link className="text-link" href={"/campus/grades" + suffix}>
              Ver calificaciones <ArrowRight size={16} />
            </Link>
          </div>
          {latest.length ? (
            <div className="grade-list">
              {latest.map((g) => (
                <div className="grade-list-row" key={g.id}>
                  <span className="grade-row-icon">
                    <CheckCheck size={18} />
                  </span>
                  <div>
                    <strong>{g.evaluation.name}</strong>
                    <p>{g.course}</p>
                  </div>
                  <span className="grade-date">
                    {new Date(g.publishedAt).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      timeZone: "America/Lima",
                    })}
                  </span>
                  <span className="grade-value">
                    {Number(g.score).toFixed(2)}
                    <small>/20</small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">Tus docentes todavía no publicaron notas.</p>
          )}
        </section>
      </div>
      <aside className="dashboard-side">
        <WeekAgenda days={calendar.days} today={calendar.weekday} items={schedules} />
        <section className="performance-panel">
          <div className="section-heading">
            <h2>Así vas avanzando</h2>
            <span className="tiny-icon">
              <GraduationCap size={19} />
            </span>
          </div>
          <div className="performance-score">
            <strong>{average === null ? "—" : average.toFixed(2)}</strong>
            <span>
              /20
              <br />
              Promedio parcial
            </span>
          </div>
          <p className="performance-caption">
            Ponderado por evaluaciones publicadas y créditos. No es una nota final.
          </p>
          <div className="performance-bars">
            {enrollments.map((e, index) => {
              const avg = partialAverage(e.grades);
              return (
                <div key={e.id} className={"performance-row tone-" + (index % 3)}>
                  <div>
                    <span>{e.section.course.code}</span>
                    <strong>{avg === null ? "Sin notas" : avg.toFixed(1)}</strong>
                  </div>
                  <meter
                    min={0}
                    max={20}
                    value={avg ?? 0}
                    aria-label={"Promedio parcial de " + e.section.course.name}
                  />
                </div>
              );
            })}
          </div>
          {rate !== null && (
            <Link href={"/campus/attendance" + suffix} className="attendance-brief">
              <CheckCheck size={17} />
              <span>Asistencia registrada</span>
              <strong>{Math.round(rate)}%</strong>
            </Link>
          )}
        </section>
        <section className="upcoming-panel">
          <div className="section-heading">
            <h2>En tu agenda</h2>
            <CalendarClock size={19} />
          </div>
          {upcoming.length ? (
            upcoming.map((v) => (
              <article className="upcoming-item" key={v.id}>
                <div className="upcoming-date">
                  <strong>{new Date(v.dueAt).getUTCDate()}</strong>
                  <span>
                    {new Date(v.dueAt).toLocaleDateString("es-PE", {
                      month: "short",
                      timeZone: "America/Lima",
                    })}
                  </span>
                </div>
                <div>
                  <h3>{v.name}</h3>
                  <p>{v.course}</p>
                  <span className="weight-label">{v.weight}% de la evaluación</span>
                </div>
              </article>
            ))
          ) : (
            <p className="empty">No hay evaluaciones pendientes de publicación.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
