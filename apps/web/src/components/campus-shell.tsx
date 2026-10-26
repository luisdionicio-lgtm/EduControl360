import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesColumn,
  CalendarDays,
  ClipboardCheck,
  Settings2,
  UserRound,
  ChevronRight,
  Building2,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { Logout } from "./auth-buttons";
import { Brand } from "./brand";
import { isDemoEnabled } from "@/lib/demo";
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
  const member = me.memberships.find((m) => m.institutionId === institutionId);
  const suffix = institutionId ? "?institution=" + institutionId : "";
  const demo = isDemoEnabled();
  const studentItems = [
    ["Inicio", "/campus", LayoutDashboard],
    ["Mis cursos", "/campus/courses", BookOpen],
    ["Mis notas", "/campus/grades", ChartNoAxesColumn],
    ["Asistencia", "/campus/attendance", ClipboardCheck],
    ["Horario", "/campus/schedule", CalendarDays],
  ] as const;
  const items =
    member && member.role !== "STUDENT"
      ? ([["Gestión académica", "/manage", Settings2]] as const)
      : studentItems;
  const initials = me.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  const role =
    member?.role === "STUDENT"
      ? "Estudiante"
      : member?.role === "TEACHER"
        ? "Docente"
        : member
          ? "Administradora / administrador"
          : "Mi cuenta";
  const navigation = (
    <nav aria-label="Navegación principal">
      {items.map(([label, href, Icon]) => (
        <Link key={href} href={href + suffix} aria-current={active === href ? "page" : undefined}>
          <Icon size={19} strokeWidth={1.7} />
          <span>{label}</span>
          {active === href && <span className="nav-active-dot" />}
        </Link>
      ))}
      <div className="nav-separator" />
      <Link
        href={"/campus/account" + suffix}
        aria-current={active === "/campus/account" ? "page" : undefined}
      >
        <UserRound size={19} />
        <span>Mi cuenta</span>
      </Link>
      {demo && (
        <Link href="/demo">
          <Sparkles size={18} />
          <span>Cambiar perfil demo</span>
        </Link>
      )}
    </nav>
  );
  return (
    <div className="shell">
      <aside className="rail">
        <Brand href={(member?.role === "STUDENT" ? "/campus" : "/manage") + suffix} />
        <div className="institution-box">
          <span className="institution-icon">
            <Building2 size={19} />
          </span>
          <div>
            <strong>{member?.institution.name ?? "Tu espacio académico"}</strong>
            <small>{member ? "Comunidad académica" : "Sin institución"}</small>
          </div>
        </div>
        {navigation}
        <footer>
          <div className="rail-person">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{me.name}</strong>
              <small>{role}</small>
            </div>
          </div>
          <Logout />
        </footer>
      </aside>
      <main className="workspace" id="contenido">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Mi campus</span>
            <ChevronRight size={14} />
            <strong>
              {active === "/manage"
                ? "Gestión académica"
                : active === "/campus"
                  ? "Resumen"
                  : (studentItems.find((i) => i[1] === active)?.[0] ?? "Mi cuenta")}
            </strong>
          </div>
          <div className="topbar-right">
            <time>
              {new Date().toLocaleDateString("es-PE", {
                weekday: "short",
                day: "numeric",
                month: "long",
                timeZone: "America/Lima",
              })}
            </time>
            <span className="avatar">{initials}</span>
          </div>
        </header>
        <details className="mobile-navigation">
          <summary>
            <Brand href="/campus" />
            <span>
              <PanelLeftClose size={21} />
              Menú
            </span>
          </summary>
          {navigation}
          <Logout />
        </details>
        {demo && (
          <div className="demo-banner">
            <span className="live-dot" />
            <strong>Demo local</strong>
            <span>Datos ficticios · Cambios persistentes</span>
            <Link href="/demo">
              Cambiar perfil <ChevronRight size={14} />
            </Link>
          </div>
        )}
        {me.memberships.length > 1 && (
          <form className="context-selector">
            <Building2 size={16} />
            <label htmlFor="institution-context">Institución</label>
            <select id="institution-context" name="institution" defaultValue={institutionId}>
              {me.memberships.map((m) => (
                <option value={m.institutionId} key={m.institutionId}>
                  {m.institution.name}
                </option>
              ))}
            </select>
            <button className="context-submit" type="submit">
              Cambiar institución <ChevronRight size={14} />
            </button>
          </form>
        )}
        {children}
        <footer className="workspace-footer">
          <span>educontrol360</span>
          <span>Tu próximo paso empieza aquí.</span>
        </footer>
      </main>
    </div>
  );
}
