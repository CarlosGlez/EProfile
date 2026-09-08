"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleStudentActiveAction,
  deleteStudentAction,
  resetPasswordAction,
} from "./actions";

export interface StudentRowData {
  id: string;
  slug: string;
  active: boolean;
  email: string;
  status: "borrador" | "publicado";
  publishedAt: string | null;
}

export default function StudentRow({ row }: { row: StudentRowData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  function handleToggleActive() {
    setError(null);
    startTransition(async () => {
      try {
        await toggleStudentActiveAction(row.id, !row.active);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar la cuenta de ${row.slug}? Esta acción no se puede deshacer.`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteStudentAction(row.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function handleResetPassword() {
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await resetPasswordAction(row.id, newPassword);
        setResetting(false);
        setNewPassword("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3 font-medium text-zinc-900">
        <Link href={`/${row.slug}`} target="_blank" className="hover:underline">
          {row.slug}
        </Link>
      </td>
      <td className="px-4 py-3 text-zinc-600">{row.email || "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            row.status === "publicado"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {row.status === "publicado" ? "Publicado" : "Borrador"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            row.active ? "bg-zinc-100 text-zinc-700" : "bg-red-50 text-red-600"
          }`}
        >
          {row.active ? "Activa" : "Desactivada"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <Link
            href={`/${row.slug}/admin`}
            className="font-medium text-zinc-700 underline"
          >
            Editar
          </Link>
          <button
            disabled={isPending}
            onClick={handleToggleActive}
            className="font-medium text-zinc-700 underline disabled:opacity-50"
          >
            {row.active ? "Desactivar" : "Reactivar"}
          </button>
          <button
            disabled={isPending}
            onClick={() => setResetting((r) => !r)}
            className="font-medium text-zinc-700 underline disabled:opacity-50"
          >
            Resetear contraseña
          </button>
          <button
            disabled={isPending}
            onClick={handleDelete}
            className="font-medium text-red-600 underline disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
        {resetting && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none"
            />
            <button
              onClick={handleResetPassword}
              disabled={isPending}
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white"
            >
              Guardar
            </button>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
