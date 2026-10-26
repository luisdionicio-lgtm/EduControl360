import { redirect } from "next/navigation";
import { api } from "./api";
import type { Me } from "@/components/campus-shell";
export async function campusContext(institution?: string) {
  const response = await api("me");
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("No se pudo cargar tu perfil. Revisa la conexión con la API.");
  const me = (await response.json()) as Me;
  const selected = institution ?? me.memberships[0]?.institutionId;
  if (selected && !me.memberships.some((m) => m.institutionId === selected)) redirect("/campus");
  return { me, institutionId: selected };
}
export interface StudentData {
  student: null | {
    id: string;
    name: string;
    code: string;
    enrollments: {
      id: string;
      section: {
        id: string;
        name: string;
        course: { name: string; code: string; credits: number };
        period: { name: string };
        schedules: {
          id: string;
          weekday: number;
          startTime: string;
          endTime: string;
          room: string;
        }[];
        evaluations: { id: string; name: string; weight: number; dueAt: string }[];
      };
      grades: {
        id: string;
        score: string;
        publishedAt: string;
        evaluation: { id: string; name: string; weight: number; dueAt: string };
      }[];
      attendance: { id: string; date: string; status: string }[];
    }[];
  };
}
export async function studentData(id: string) {
  const response = await api("institutions/" + id + "/student");
  if (!response.ok) throw new Error("No se pudo cargar tu información académica.");
  return (await response.json()) as StudentData;
}
