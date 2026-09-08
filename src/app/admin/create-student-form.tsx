"use client";

import { useActionState } from "react";
import { createStudentAction, type CreateStudentState } from "./actions";

const initialState: CreateStudentState = { error: null, success: null };

export default function CreateStudentForm() {
  const [state, formAction, pending] = useActionState(
    createStudentAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-3xl nm-raised p-6 sm:grid-cols-4 sm:items-end"
    >
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-nm-soft">
          Correo del estudiante
        </label>
        <input
          name="email"
          type="email"
          required
          className="nm-input w-full rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="alumno@correo.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-nm-soft">
          Ruta (slug)
        </label>
        <input
          name="slug"
          required
          pattern="[a-z0-9-]{3,40}"
          className="nm-input w-full rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="luisjz"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-nm-soft">
          Contraseña temporal
        </label>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          className="nm-input w-full rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          placeholder="mínimo 8 caracteres"
        />
      </div>
      <div className="sm:col-span-4">
        <button
          type="submit"
          disabled={pending}
          className="nm-accent inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending && (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin-slow" />
          )}
          {pending ? "Creando…" : "Crear cuenta de estudiante"}
        </button>
        {state.error && (
          <p className="animate-fade-up mt-3 nm-inset rounded-xl px-3 py-2 text-sm text-nm-danger">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="animate-fade-up mt-3 nm-inset rounded-xl px-3 py-2 text-sm text-nm-ok">
            {state.success}
          </p>
        )}
      </div>
    </form>
  );
}
