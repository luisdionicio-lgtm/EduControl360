import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ChartNoAxesColumn,
  CalendarDays,
  ClipboardCheck,
  Settings2,
  UserRound,
} from "lucide-react";
import { Logout } from "./auth-buttons";
export interface Membership {
  institutionId: string;
  role: string;
  institution: { id: string; name: string; slug: string };
}
export interface Me {
  id: string;
  name: string;
  email: string;
  memberships: Membership[];
}
export function CampusShell({
  me,
  active,
  institutionId,
  children,
}: {
  me: Me;
  active: string;
  institutionId?: string;
  children: React.ReactNode;
}) {
  const membership = me.memberships.find((m) => m.institutionId === institutionId);
  const suffix = institutionId ? "?institution=" + institutionId : "";
  const items = [
    ["Inicio", "/campus", LayoutDashboard],
    ["Mis cursos", "/campus/courses", BookOpen],
    ["Mis notas", "/campus/grades", ChartNoAxesColumn],
    ["Asistencia", "/campus/attendance", ClipboardCheck],
    ["Horario", "/campus/schedule", CalendarDays],
    ["Mi cuenta", "/campus/account", UserRound],
  ] as const;
  return (
    <div className="shell">
      <aside className="rail">
        <Link className="brand" href={"/campus" + suffix}>
          <GraduationCap size={28} />
          EduControl 360
        </Link>
        <div>{membership && <p className="institution">{membership.institution.name}</p>}</div>
        <nav aria-label="Navegación principal">
          {items.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href + suffix}
              aria-current={active === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {membership && membership.role !== "STUDENT" && (
            <Link
              href={"/manage" + suffix}
              aria-current={active === "/manage" ? "page" : undefined}
            >
              <Settings2 size={18} />
              Gestión académica
            </Link>
          )}
        </nav>
        <footer>
          <small>Aprender. Conectar. Avanzar.</small>
        </footer>
      </aside>
      <main className="workspace" id="contenido">
        <header className="topbar">
          <div>
            <strong>{me.name}</strong>
            <p className="muted">
              {membership?.role === "STUDENT"
                ? "Estudiante"
                : membership?.role === "TEACHER"
                  ? "Docente"
                  : membership
                    ? "Administrador"
                    : "Mi espacio académico"}
            </p>
          </div>
          <Logout />
        </header>
        {me.memberships.length > 1 && (
          <form className="context-selector">
            <label>
              Institución
              <select name="institution" defaultValue={institutionId}>
                {me.memberships.map((m) => (
                  <option value={m.institutionId} key={m.institutionId}>
                    {m.institution.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary" type="submit">
              Cambiar institución
            </button>
          </form>
        )}
        {children}
      </main>
    </div>
  );
}
