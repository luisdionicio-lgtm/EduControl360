import { NextRequest } from "next/server";
import { api } from "@/lib/api";
const allowed =
  /^(me|institutions(?:\/[a-f0-9-]{36}(?:\/(?:student|academic|settings|audit|programs|courses|students|periods|sections|enrollments|evaluations|grades|attendance|schedules|domains|invitations)(?:\/[a-f0-9-]{36}(?:\/(?:teacher|verify))?)?)?)?|invitations\/accept)$/;
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const route = path.join("/");
  if (!allowed.test(route))
    return Response.json({ message: "Ruta no disponible." }, { status: 404 });
  if (request.method === "POST") {
    const trustedOrigin = new URL(process.env.NEXTAUTH_URL ?? request.nextUrl.origin).origin;
    if (request.headers.get("origin") !== trustedOrigin)
      return Response.json({ message: "Origen no permitido." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 16384)
      return Response.json({ message: "Solicitud demasiado grande." }, { status: 413 });
  }
  try {
    const body = request.method === "POST" ? await request.text() : undefined;
    if (body && body.length > 16384)
      return Response.json({ message: "Solicitud demasiado grande." }, { status: 413 });
    const response = await api(route, { method: request.method, body });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { message: "No se pudo conectar al servidor. Inténtalo de nuevo." },
      { status: 503 },
    );
  }
}
export { handle as GET, handle as POST };
