import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, googleConfigured } from "@/lib/auth";
import { GoogleLogin } from "@/components/auth-buttons";
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
    } catch {
      /* Show login when API is unavailable. */
    }
    if (valid) redirect("/campus");
  }
  const { error } = await searchParams;
  return (
    <main id="contenido" className="login">
      <section className="login-story">
        <Link className="brand" href="/">
          <GraduationCap size={28} />
          EduControl 360
        </Link>
        <div>
          <BookOpen size={40} />
          <h1>Tu próximo paso empieza aquí.</h1>
          <p>
            Un espacio para seguir aprendiendo. Tus cursos, tus notas y tu institución, conectados.
          </p>
        </div>
        <p>Aprender. Conectar. Avanzar.</p>
      </section>
      <section className="login-form">
        <h2>Bienvenido a tu campus</h2>
        <p className="muted">
          Inicia sesión con tu cuenta Google. Tu institución confirmará el acceso a tu información
          académica.
        </p>
        <GoogleLogin enabled={googleConfigured} />
        {!googleConfigured && (
          <div className="notice">
            La conexión con Google está pendiente de configurar. El administrador debe completar las
            credenciales OAuth en el entorno local.
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            No se pudo iniciar sesión. Comprueba que tu correo esté verificado y vuelve a
            intentarlo.
          </p>
        )}
        <p className="muted">
          <ShieldCheck size={16} /> Tu correo identifica tu cuenta. La membresía institucional
          determina tus permisos.
        </p>
        <Link href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
