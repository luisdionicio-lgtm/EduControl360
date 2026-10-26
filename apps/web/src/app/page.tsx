import { redirect } from "next/navigation";
import { isDemoEnabled } from "@/lib/demo";
export const dynamic = "force-dynamic";
export default function Home() {
  redirect(isDemoEnabled() ? "/demo" : "/login");
}
