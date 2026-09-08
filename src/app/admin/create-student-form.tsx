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
      className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-4 sm:items-end"
    >
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Correo del estudiante
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="alumno@correo.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Ruta (slug)
        </label>
        <input
          name="slug"
          required
          pattern="[a-z0-9-]{3,40}"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="luisjz"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Contraseña temporal
        </label>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="mínimo 8 caracteres"
        />
      </div>
      <div className="sm:col-span-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear cuenta de estudiante"}
        </button>
        {state.error && (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
        {state.success && (
          <p className="mt-2 text-sm text-emerald-600">{state.success}</p>
        )}
      </div>
    </form>
  );
}
