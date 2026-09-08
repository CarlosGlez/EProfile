"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/app/login/actions";

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "nm-raised-sm nm-press inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-nm-soft hover:text-nm-danger disabled:opacity-60"
      }
    >
      {pending ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-nm-soft border-t-transparent animate-spin-slow" />
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )}
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}

// Botón de cierre de sesión reutilizable (panel de plataforma y panel del
// estudiante). Usa el Server Action `logoutAction`, que limpia la sesión de
// Supabase y redirige a /login.
export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <SubmitButton className={className} />
    </form>
  );
}
