import Link from "next/link";
import {
  Layers3,
  ShieldCheck,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  ChartNoAxesColumn,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, googleConfigured } from "@/lib/auth";
import { isDemoEnabled } from "@/lib/demo";
import { GoogleLogin } from "@/components/auth-buttons";
import { Brand } from "@/components/brand";
import { api } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getServerSession(authOptions)) {
    let valid = false;
    try {
      valid = (await api("me")).ok;
    } catch {}
    if (valid) redirect("/campus");
  }
  const { error } = await searchParams;
  return (
    <main id="contenido" className="login">
      <section className="login-story">
        <Brand />
        <div className="login-statement">
          <h1>
            Tu futuro.
            <br />
            Tu ritmo.
            <br />
            <span>Tu campus.</span>
          </h1>
          <p>Lo que aprendes hoy cambia lo que puedes construir mañana.</p>
          <div className="login-capabilities">
            <span>
              <BookOpen size={18} />
              Tus cursos
            </span>
            <span>
              <ChartNoAxesColumn size={18} />
              Tu avance
            </span>
            <span>
              <CalendarDays size={18} />
              Tu semana
            </span>
          </div>
        </div>
        <div className="login-story-footer">
          <Layers3 size={24} />
          <p>
            Un espacio que conecta
            <br />
            cada parte de tu vida académica.
          </p>
        </div>
      </section>
      <section className="login-form">
        <div className="login-form-inner">
          <span className="login-symbol">
            <Layers3 size={28} />
          </span>
          <h2>Bienvenido a tu campus</h2>
          <p className="muted">
            Tu próximo paso empieza aquí. Conecta tu cuenta para entrar a tu espacio académico.
          </p>
          <GoogleLogin enabled={googleConfigured} />
          {!googleConfigured && (
            <div className="notice">
              La conexión con Google está pendiente de configurar. Tu institución debe completar las
              credenciales OAuth.
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              No se pudo iniciar sesión. Comprueba que tu cuenta esté verificada y vuelve a
              intentarlo.
            </p>
          )}
          {isDemoEnabled() && (
            <Link className="demo-login-link" href="/demo">
              Explorar la demo funcional <ArrowUpRight size={18} />
            </Link>
          )}
          <div className="login-security">
            <ShieldCheck size={20} />
            <p>Tu identidad es tuya. Tu institución define a qué información puedes acceder.</p>
          </div>
          <Link className="back-link" href="/">
            Volver al inicio
          </Link>
        </div>
        <footer>EduControl 360 · Tu aprendizaje, conectado.</footer>
      </section>
    </main>
  );
}
