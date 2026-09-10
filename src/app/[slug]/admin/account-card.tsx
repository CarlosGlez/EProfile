"use client";

import { useState, useTransition } from "react";
import { changeOwnPasswordAction } from "./actions";

// Cambio de contraseña autoservicio para el estudiante desde su panel.
export default function AccountCard({
  slug,
  email,
}: {
  slug: string;
  email: string | null;
}) {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMsg(null);
    setErr(null);
    if (pwd.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwd !== pwd2) {
      setErr("Las dos contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      try {
        await changeOwnPasswordAction(slug, pwd);
        setPwd("");
        setPwd2("");
        setMsg("Contraseña actualizada.");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error al cambiar la contraseña.");
      }
    });
  }

  return (
    <div className="rounded-2xl nm-raised p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-nm-heading">
        Mi cuenta
      </h2>
      {email && <p className="mb-4 text-xs text-nm-soft">{email}</p>}

      <div className="space-y-2.5">
        <input
          type="password"
          className="nm-input w-full rounded-lg border-0 px-3 py-2 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <input
          type="password"
          className="nm-input w-full rounded-lg border-0 px-3 py-2 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
        />
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="nm-accent w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </div>

      {err && (
        <p className="animate-fade-up mt-3 nm-inset rounded-xl px-3 py-2 text-xs text-nm-danger">
          {err}
        </p>
      )}
      {msg && (
        <p className="animate-fade-up mt-3 nm-inset rounded-xl px-3 py-2 text-xs text-nm-ok">
          {msg}
        </p>
      )}
    </div>
  );
}
