import Link from "next/link";
import { BookOpen, GraduationCap, LayoutDashboard, ShieldCheck, ArrowRight, Activity } from "lucide-react";
export const dynamic = "force-dynamic";
async function getHealth() {
 try {
  const response = await fetch((process.env.API_URL ?? "http://localhost:4000") + "/health/ready", {cache:"no-store", signal:AbortSignal.timeout(4000)});
  return response.ok;
 } catch { return false; }
}
export default async function Home() {
 const ready = await getHealth();
 return <div className="shell"><aside className="rail"><Link className="brand" href="/"><GraduationCap size={28}/>EduControl 360</Link><small>ESPACIO ACADÉMICO</small><nav><Link href="/" aria-current="page"><LayoutDashboard size={18}/>Inicio</Link><Link href="/login"><BookOpen size={18}/>Portal estudiante</Link></nav><footer><small>Aprender. Conectar. Avanzar.</small></footer></aside><main className="workspace" id="contenido"><header className="topbar"><span>Tu campus, conectado.</span><span className="badge"><ShieldCheck size={14}/>Entorno local</span></header><div className="intro"><div><h1>Todo empieza con una buena base.</h1><p>EduControl 360 reúne tu experiencia académica en un solo lugar.</p></div><Link className="button" href="/login">Ir al portal <ArrowRight size={16}/></Link></div><section className="panel"><h2>Estado de la plataforma</h2><p className="muted">Comprobación en tiempo real de la API y sus servicios de persistencia.</p><ul className="status-list"><li><span>Next.js · Interfaz web</span><strong className="ok">Disponible</strong></li><li><span>NestJS · PostgreSQL · Redis</span><strong className={ready?"ok":"error"}>{ready?"Conectados":"Sin conexión"}</strong></li><li><span>Google · Autenticación</span><span className="muted">Configuración pendiente</span></li></ul></section><section className="panel"><Activity size={24}/><h2>Tu información será real.</h2><p className="muted">Aquí verás tus cursos y notas cuando tu institución confirme tu membresía y matrícula. Ningún correo o dominio concede permisos por sí solo.</p></section></main></div>;
}
