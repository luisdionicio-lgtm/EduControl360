import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDemoEnabled } from "@/lib/demo";
import { DemoProfiles } from "@/components/demo-login";
import { Brand } from "@/components/brand";
import { Database, ShieldCheck, ArrowRight } from "lucide-react";
import { createDatabase } from "@edu/database";
export const dynamic = "force-dynamic";
export default async function Demo() {
  if (!isDemoEnabled()) notFound();
  const session = await getServerSession(authOptions);
  const db = createDatabase();
  let institutionId: string;
  try {
    institutionId = (
      await db.institution.findUniqueOrThrow({
        where: { slug: "demo-" + process.env.DEMO_INSTANCE_ID },
        select: { id: true },
      })
    ).id;
  } finally {
    await db.$disconnect();
  }
  return (
    <main className="demo-page" id="contenido">
      <header className="public-header">
        <Brand href="/demo" />
        <span className="demo-label">
          <span className="live-dot" />
          Entorno de demostración
        </span>
      </header>
      <section className="demo-intro">
        <h1>
          Un campus.
          <br />
          <span>Tres formas de vivirlo.</span>
        </h1>
        <p>
          Entra, explora y prueba. La información es ficticia; las acciones, los permisos y la
          persistencia funcionan de verdad.
        </p>
      </section>
      <DemoProfiles hasSession={Boolean(session)} institutionId={institutionId} />
      <section className="demo-explainer">
        <div>
          <Database size={20} />
          <p>
            Base PostgreSQL exclusiva para la demo. Tus cambios se conservan al cambiar de perfil.
          </p>
        </div>
        <div>
          <ShieldCheck size={20} />
          <p>Acceso local de demostración. No utiliza ni simula un inicio de sesión con Google.</p>
        </div>
      </section>
      <details className="demo-scope">
        <summary>
          Qué puedes probar y qué sigue pendiente <ArrowRight size={16} />
        </summary>
        <div className="two-col">
          <div>
            <h2>Listo para recorrer</h2>
            <p>
              Cursos, períodos, secciones, matrículas, asignación docente, evaluaciones, notas,
              asistencia, horarios y cambio de institución.
            </p>
          </div>
          <div>
            <h2>Próximas fases</h2>
            <p>
              Google real y verificación DNS, integraciones Workspace, pagos, comunicaciones,
              materiales, portal familiar, reportes avanzados y Gemini.
            </p>
          </div>
        </div>
      </details>
      <footer className="public-footer">
        EduControl 360 · Campus Atelier{" "}
        <span>Diseñado para aprender. Construido para conectar.</span>
      </footer>
    </main>
  );
}
