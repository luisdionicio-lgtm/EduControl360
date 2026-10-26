"use client";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
interface Option {
  value: string;
  label: string;
}
interface Field {
  name: string;
  label: string;
  type?: "number" | "email" | "date" | "time" | "checkbox";
  options?: Option[];
  min?: number;
  max?: number;
  step?: string;
  pattern?: string;
  placeholder?: string;
}
interface FormProps {
  title: string;
  description?: string;
  path: string;
  fields: Field[];
  button: string;
}
function ActionForm({ title, description, path, fields, button }: FormProps) {
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setResult("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values.get(field.name);
      data[field.name] =
        field.type === "number"
          ? Number(value)
          : field.type === "checkbox"
            ? value === "on"
            : field.type === "date"
              ? String(value) + "T00:00:00.000Z"
              : String(value ?? "");
    }
    // Attendance is a calendar date rather than an instant.
    if (path.endsWith("/attendance")) data.date = String(values.get("date"));
    try {
      const response = await fetch("/api/backend/" + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const output = await response.json();
      if (!response.ok)
        throw new Error(
          Array.isArray(output.message)
            ? output.message.join(" ")
            : (output.message ?? "No se pudo guardar."),
        );
      setResult(
        output.token
          ? "Invitación creada. Código de un solo uso: " + output.token
          : output.challenge
            ? "Publica un TXT en " + output.dnsName + " con el valor " + output.challenge
            : "Guardado correctamente.",
      );
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar al servidor.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel">
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        {fields.map((field) => (
          <div className="field" key={field.name}>
            <label htmlFor={formId + field.name}>{field.label}</label>
            {field.options ? (
              <select id={formId + field.name} name={field.name} required defaultValue="">
                <option value="" disabled>
                  Seleccionar…
                </option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={formId + field.name}
                name={field.name}
                type={field.type ?? "text"}
                required={field.type !== "checkbox"}
                min={field.min}
                max={field.max}
                step={field.step}
                pattern={field.pattern}
                placeholder={field.placeholder}
                maxLength={field.type === "email" ? 254 : field.type ? undefined : 253}
              />
            )}
          </div>
        ))}
        {fields.some((f) => f.options && !f.options.length) && (
          <p className="notice">
            Antes de continuar, registra o selecciona:{" "}
            {fields
              .filter((f) => f.options && !f.options.length)
              .map((f) => f.label.toLowerCase())
              .join(", ")}
            . Encontrarás estas opciones en estructura académica, estudiantes o accesos.
          </p>
        )}
        <button
          className="button"
          disabled={pending || fields.some((f) => f.options && !f.options.length)}
        >
          {pending ? "Guardando…" : button}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <p className="result" role="status">
          {result}
        </p>
      )}
    </section>
  );
}
export interface AcademicData {
  programs: { id: string; name: string; courses: { id: string; name: string; code: string }[] }[];
  students: { id: string; name: string; code: string }[];
  periods: { id: string; name: string }[];
  teachers: { user: { id: string; name: string; email: string } }[];
  sections: {
    id: string;
    name: string;
    course: { name: string };
    period: { name: string };
    enrollments: { id: string; student: { name: string; code: string } }[];
    evaluations: { id: string; name: string }[];
  }[];
}
export interface SettingsData {
  domains: { id: string; domain: string; challenge: string; verifiedAt: string | null }[];
}
export function Management({
  institutionId,
  role,
  data,
  settings,
}: {
  institutionId: string;
  role: string;
  data: AcademicData;
  settings: SettingsData | null;
}) {
  const [tab, setTab] = useState(role === "ADMIN" ? "academic" : "grades");
  const base = "institutions/" + institutionId + "/";
  const programs = data.programs.map((p) => ({ value: p.id, label: p.name }));
  const courses = data.programs.flatMap((p) =>
    p.courses.map((c) => ({ value: c.id, label: c.code + " · " + c.name })),
  );
  const sections = data.sections.map((s) => ({
    value: s.id,
    label: s.course.name + " · " + s.name,
  }));
  const enrollments = data.sections.flatMap((s) =>
    s.enrollments.map((e) => ({
      value: e.id,
      label: e.student.name + " · " + s.course.name + " · " + s.name,
    })),
  );
  const evaluations = data.sections.flatMap((s) =>
    s.evaluations.map((e) => ({
      value: e.id,
      label: e.name + " · " + s.course.name + " · " + s.name,
    })),
  );
  return (
    <>
      <nav className="tabs" aria-label="Secciones de gestión académica">
        {(role === "ADMIN"
          ? [
              ["academic", "Estructura académica"],
              ["students", "Estudiantes y matrícula"],
              ["grades", "Evaluaciones y notas"],
              ["settings", "Accesos y dominio"],
            ]
          : [["grades", "Evaluaciones y notas"]]
        ).map(([id, title]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {title}
          </button>
        ))}
      </nav>
      <div className="management-grid">
        {tab === "academic" && (
          <>
            <ActionForm
              title="Crear programa"
              path={base + "programs"}
              fields={[{ name: "name", label: "Nombre del programa" }]}
              button="Crear programa"
            />
            <ActionForm
              title="Crear curso"
              path={base + "courses"}
              fields={[
                { name: "programId", label: "Programa", options: programs },
                { name: "name", label: "Nombre del curso" },
                { name: "code", label: "Código", pattern: "[A-Z0-9-]{2,20}" },
                { name: "credits", label: "Créditos", type: "number", min: 1, max: 30 },
              ]}
              button="Crear curso"
            />
            <ActionForm
              title="Crear período"
              path={base + "periods"}
              fields={[
                { name: "name", label: "Nombre del período" },
                { name: "startsAt", label: "Fecha inicial", type: "date" },
                { name: "endsAt", label: "Fecha final", type: "date" },
              ]}
              button="Crear período"
            />
            <ActionForm
              title="Crear sección"
              path={base + "sections"}
              fields={[
                { name: "courseId", label: "Curso", options: courses },
                {
                  name: "periodId",
                  label: "Período",
                  options: data.periods.map((p) => ({ value: p.id, label: p.name })),
                },
                { name: "name", label: "Nombre de sección" },
              ]}
              button="Crear sección"
            />
            <TeacherForm
              base={base}
              sections={sections}
              teachers={data.teachers.map((t) => ({
                value: t.user.id,
                label: t.user.name + " · " + t.user.email,
              }))}
            />
            <ActionForm
              title="Registrar horario"
              path={base + "schedules"}
              fields={[
                { name: "sectionId", label: "Sección", options: sections },
                {
                  name: "weekday",
                  label: "Día: lunes 1 a domingo 7",
                  type: "number",
                  min: 1,
                  max: 7,
                },
                { name: "startTime", label: "Hora inicial", type: "time" },
                { name: "endTime", label: "Hora final", type: "time" },
                { name: "room", label: "Aula" },
              ]}
              button="Guardar horario"
            />
          </>
        )}
        {tab === "students" && (
          <>
            <ActionForm
              title="Registrar estudiante"
              description="El registro se vincula a su cuenta al aceptar una invitación con el mismo correo."
              path={base + "students"}
              fields={[
                { name: "name", label: "Nombre completo" },
                { name: "email", label: "Correo Google", type: "email" },
                { name: "code", label: "Código de estudiante", pattern: "[A-Z0-9-]{2,30}" },
              ]}
              button="Registrar estudiante"
            />
            <ActionForm
              title="Matricular estudiante"
              path={base + "enrollments"}
              fields={[
                {
                  name: "studentId",
                  label: "Estudiante",
                  options: data.students.map((s) => ({
                    value: s.id,
                    label: s.code + " · " + s.name,
                  })),
                },
                { name: "sectionId", label: "Sección", options: sections },
              ]}
              button="Confirmar matrícula"
            />
          </>
        )}
        {tab === "grades" && (
          <>
            <ActionForm
              title="Crear evaluación"
              description="La suma de pesos de las evaluaciones de una sección no puede superar el 100 %."
              path={base + "evaluations"}
              fields={[
                { name: "sectionId", label: "Sección", options: sections },
                { name: "name", label: "Nombre de la evaluación" },
                { name: "weight", label: "Peso (%)", type: "number", min: 1, max: 100 },
                { name: "dueAt", label: "Fecha", type: "date" },
              ]}
              button="Crear evaluación"
            />
            <ActionForm
              title="Registrar calificación"
              description="Selecciona una matrícula y una evaluación de la misma sección. Solo las notas publicadas son visibles para estudiantes."
              path={base + "grades"}
              fields={[
                { name: "enrollmentId", label: "Matrícula", options: enrollments },
                { name: "evaluationId", label: "Evaluación", options: evaluations },
                {
                  name: "score",
                  label: "Nota (0–20)",
                  type: "number",
                  min: 0,
                  max: 20,
                  step: "0.01",
                },
                {
                  name: "publish",
                  label: "Publicar nota en el portal estudiante",
                  type: "checkbox",
                },
              ]}
              button="Guardar calificación"
            />
            <ActionForm
              title="Registrar asistencia"
              path={base + "attendance"}
              fields={[
                { name: "enrollmentId", label: "Matrícula", options: enrollments },
                { name: "date", label: "Fecha", type: "date" },
                {
                  name: "status",
                  label: "Estado",
                  options: [
                    { value: "PRESENT", label: "Presente" },
                    { value: "LATE", label: "Tardanza" },
                    { value: "ABSENT", label: "Ausente" },
                    { value: "EXCUSED", label: "Justificada" },
                  ],
                },
              ]}
              button="Guardar asistencia"
            />
          </>
        )}
        {tab === "settings" && (
          <>
            <ActionForm
              title="Verificar dominio"
              description="Se generará un desafío DNS TXT. El dominio permite identificar a la institución; nunca otorga permisos."
              path={base + "domains"}
              fields={[
                {
                  name: "domain",
                  label: "Dominio institucional",
                  placeholder: "institucion.edu.pe",
                  pattern: "[a-z0-9.-]+[.][a-z]{2,63}",
                },
              ]}
              button="Generar desafío"
            />
            <section className="panel">
              <h2>Dominios registrados</h2>
              {settings?.domains.length ? (
                settings.domains.map((d) => (
                  <DomainVerification key={d.id} base={base} domain={d} />
                ))
              ) : (
                <p className="empty">No hay dominios registrados.</p>
              )}
            </section>
            <ActionForm
              title="Invitar miembro"
              description="Requiere al menos un dominio verificado. El código se muestra una vez; compártelo con la persona invitada. No se envía correo automáticamente."
              path={base + "invitations"}
              fields={[
                { name: "email", label: "Correo Google", type: "email" },
                {
                  name: "role",
                  label: "Rol institucional",
                  options: [
                    { value: "ADMIN", label: "Administrador" },
                    { value: "TEACHER", label: "Docente" },
                    { value: "STUDENT", label: "Estudiante" },
                  ],
                },
              ]}
              button="Crear invitación"
            />
          </>
        )}
      </div>
    </>
  );
}
function TeacherForm({
  base,
  sections,
  teachers,
}: {
  base: string;
  sections: Option[];
  teachers: Option[];
}) {
  const [section, setSection] = useState("");
  return (
    <section className="teacher-select">
      <label>
        Sección a asignar
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="">Selecciona una sección…</option>
          {sections.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {section ? (
        <ActionForm
          title="Asignar docente"
          path={base + "sections/" + section + "/teacher"}
          fields={[{ name: "teacherId", label: "Docente con membresía activa", options: teachers }]}
          button="Asignar docente"
        />
      ) : (
        <p className="muted">Selecciona la sección para asignar un docente autorizado.</p>
      )}
    </section>
  );
}
function DomainVerification({
  base,
  domain,
}: {
  base: string;
  domain: SettingsData["domains"][number];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function verify() {
    setPending(true);
    setMessage("");
    try {
      const r = await fetch("/api/backend/" + base + "domains/" + domain.id + "/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const d = await r.json();
      setMessage(r.ok ? "Dominio verificado." : d.message);
      if (r.ok) router.refresh();
    } catch {
      setMessage("No se pudo verificar el DNS. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="domain-row">
      <strong>{domain.domain}</strong>
      <p className={domain.verifiedAt ? "ok" : "muted"}>
        {domain.challenge.startsWith("DEMO-ONLY")
          ? "Precargado para la demo · No es una verificación DNS real"
          : domain.verifiedAt
            ? "Verificado"
            : "Pendiente de verificación"}
      </p>
      {!domain.verifiedAt && (
        <>
          <p className="result">
            Nombre: _educontrol360.{domain.domain}
            <br />
            TXT: {domain.challenge}
          </p>
          <button className="button secondary" onClick={() => void verify()} disabled={pending}>
            {pending ? "Verificando…" : "Comprobar DNS"}
          </button>
        </>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
