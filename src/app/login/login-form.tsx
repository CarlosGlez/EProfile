"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-nm-heading">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="nm-input rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="tu@correo.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-nm-heading"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="nm-input rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="animate-fade-up nm-inset rounded-xl px-3 py-2 text-sm text-nm-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="nm-accent mt-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {pending && (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin-slow" />
        )}
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
