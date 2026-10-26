import { redirect } from "next/navigation";
import { CampusShell } from "@/components/campus-shell";
import { Management, AcademicData, SettingsData } from "@/components/management";
import { campusContext } from "@/lib/campus";
import { api } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function Manage({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string }>;
}) {
  const { institution } = await searchParams;
  const { me, institutionId } = await campusContext(institution);
  if (!institutionId) redirect("/campus");
  const member = me.memberships.find((m) => m.institutionId === institutionId)!;
  if (member.role === "STUDENT") redirect("/campus?institution=" + institutionId);
  const response = await api("institutions/" + institutionId + "/academic");
  if (!response.ok) throw new Error("No se pudo cargar la gestión académica.");
  const data = (await response.json()) as AcademicData;
  let settings: SettingsData | null = null;
  if (member.role === "ADMIN") {
    const result = await api("institutions/" + institutionId + "/settings");
    if (!result.ok) throw new Error("No se pudo cargar la configuración.");
    settings = (await result.json()) as SettingsData;
  }
  return (
    <CampusShell me={me} active="/manage" institutionId={institutionId}>
      <div className="intro">
        <div>
          <h1>Gestión académica</h1>
          <p>Información que conecta a tu institución con cada estudiante.</p>
        </div>
        <span className="badge">{member.role === "ADMIN" ? "Administrador" : "Docente"}</span>
      </div>
      <Management
        institutionId={institutionId}
        role={member.role}
        data={data}
        settings={settings}
      />
    </CampusShell>
  );
}
