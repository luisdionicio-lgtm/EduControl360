import { getServerSession } from "next-auth";
import { sign } from "jsonwebtoken";
import { authOptions } from "./auth";
export async function api(path: string, init: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || !session.sessionId)
    return new Response(JSON.stringify({ message: "Inicia sesión para continuar." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const secret = process.env.API_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("API_SESSION_SECRET is required");
  const token = sign({ sid: session.sessionId }, secret, {
    algorithm: "HS256",
    subject: session.user.id,
    issuer: "educontrol-web",
    audience: "educontrol-api",
    expiresIn: 60,
  });
  return fetch((process.env.API_URL ?? "http://localhost:4000") + "/" + path, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...init.headers,
    },
  });
}
