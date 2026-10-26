"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Onboarding() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>, path: string) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/backend/" + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message);
      setMessage("Información guardada.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="two-col">
      <section className="panel">
        <h2>Únete a tu institución</h2>
        <p className="muted">
          Solicita una invitación a la administración. Tu correo Google debe coincidir con el correo
          invitado.
        </p>
        <form className="form-grid" onSubmit={(e) => void submit(e, "invitations/accept")}>
          <label>
            Código de invitación
            <input name="token" required pattern="[a-f0-9]{64}" maxLength={64} autoComplete="off" />
          </label>
          <button className="button" disabled={pending}>
            Aceptar invitación
          </button>
        </form>
      </section>
      <section className="panel">
        <h2>¿Representas a una institución?</h2>
        <p className="muted">
          Crea un espacio nuevo. Serás responsable de verificar su dominio y administrar sus
          miembros.
        </p>
        <form className="form-grid" onSubmit={(e) => void submit(e, "institutions")}>
          <label>
            Nombre de la institución
            <input name="name" required minLength={3} maxLength={120} />
          </label>
          <label>
            Identificador público
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={60}
              placeholder="mi-institucion"
            />
          </label>
          <button className="button secondary" disabled={pending}>
            Registrar institución
          </button>
        </form>
      </section>
      <p role="status">{message}</p>
    </div>
  );
}
