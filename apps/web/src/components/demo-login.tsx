"use client";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { ArrowUpRight, BookOpen, Presentation, Building2, LoaderCircle } from "lucide-react";
const profiles = [
  {
    role: "STUDENT",
    name: "Lucía Torres",
    label: "Estudiante",
    Icon: BookOpen,
    text: "Recorre tus cursos, consulta notas y organiza tu semana.",
    destination: "/campus",
  },
  {
    role: "TEACHER",
    name: "Diego Mendoza",
    label: "Docente",
    Icon: Presentation,
    text: "Crea evaluaciones, publica notas y registra asistencia.",
    destination: "/manage",
  },
  {
    role: "ADMIN",
    name: "Valeria Ríos",
    label: "Administradora",
    Icon: Building2,
    text: "Gestiona programas, cursos, docentes y matrículas.",
    destination: "/manage",
  },
];
export function DemoProfiles({
  hasSession,
  institutionId,
}: {
  hasSession: boolean;
  institutionId: string;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function enter(role: string, destination: string) {
    setPending(role);
    setError("");
    try {
      if (hasSession) await signOut({ redirect: false });
      const result = await signIn("demo", {
        role,
        redirect: false,
        callbackUrl: destination + "?institution=" + institutionId,
      });
      if (!result?.ok)
        throw new Error("La demo no está preparada. Ejecuta el comando de inicialización.");
      window.location.assign(result.url ?? destination);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo abrir el perfil.");
      setPending(null);
    }
  }
  return (
    <>
      <div className="demo-profiles">
        {profiles.map(({ role, name, label, Icon, text, destination }, index) => (
          <button
            key={role}
            className={"demo-profile tone-" + index}
            disabled={pending !== null}
            onClick={() => void enter(role, destination)}
          >
            <span className="demo-profile-top">
              <Icon size={26} />
              <ArrowUpRight size={21} />
            </span>
            <span className="demo-profile-label">{label}</span>
            <strong>{name}</strong>
            <span className="muted">{text}</span>
            <span className="demo-enter">
              {pending === role ? (
                <>
                  <LoaderCircle className="spinner" size={17} />
                  Abriendo tu espacio…
                </>
              ) : (
                "Explorar este perfil"
              )}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </>
  );
}
