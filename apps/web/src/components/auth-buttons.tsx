"use client";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, ArrowRight } from "lucide-react";
export function GoogleLogin({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      className="button"
      disabled={!enabled || pending}
      onClick={() => {
        setPending(true);
        void signIn("google", { callbackUrl: "/campus" }).catch(() => setPending(false));
      }}
    >
      {pending ? "Conectando con Google…" : "Continuar con Google"}
      <ArrowRight size={16} />
    </button>
  );
}
export function Logout() {
  return (
    <button className="button secondary" onClick={() => void signOut({ callbackUrl: "/login" })}>
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}
