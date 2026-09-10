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

export default function StudentRow({
  row,
  index = 0,
}: {
  row: StudentRowData;
  index?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const url = `${window.location.origin}/${row.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", url);
    }
  }

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
    <tr
      className="animate-fade-up align-top transition-opacity data-[pending=true]:opacity-50"
      data-pending={isPending}
      style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}
    >
      <td className="px-5 py-4 font-semibold text-nm-heading">
        <Link
          href={`/${row.slug}`}
          target="_blank"
          className="nm-press inline-block rounded-lg px-1 hover:text-nm-accent"
        >
          {row.slug}
        </Link>
      </td>
      <td className="px-5 py-4 text-nm-soft">{row.email || "—"}</td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full nm-inset px-3 py-1 text-xs font-semibold ${
            row.status === "publicado" ? "text-nm-ok" : "text-[#c98a1b]"
          }`}
        >
          {row.status === "publicado" ? "Publicado" : "Borrador"}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full nm-inset px-3 py-1 text-xs font-semibold ${
            row.active ? "text-nm-soft" : "text-nm-danger"
          }`}
        >
          {row.active ? "Activa" : "Desactivada"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <Link
            href={`/${row.slug}/admin`}
            className="nm-raised-sm nm-press rounded-lg px-2.5 py-1.5 font-semibold text-nm-heading"
          >
            Editar
          </Link>
          <button
            onClick={handleCopyLink}
            className="nm-raised-sm nm-press rounded-lg px-2.5 py-1.5 font-semibold text-nm-heading"
          >
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
          <button
            disabled={isPending}
            onClick={handleToggleActive}
            className="nm-raised-sm nm-press rounded-lg px-2.5 py-1.5 font-semibold text-nm-heading disabled:opacity-50"
          >
            {row.active ? "Desactivar" : "Reactivar"}
          </button>
          <button
            disabled={isPending}
            onClick={() => setResetting((r) => !r)}
            className="nm-raised-sm nm-press rounded-lg px-2.5 py-1.5 font-semibold text-nm-heading disabled:opacity-50"
          >
            Resetear contraseña
          </button>
          <button
            disabled={isPending}
            onClick={handleDelete}
            className="nm-raised-sm nm-press rounded-lg px-2.5 py-1.5 font-semibold text-nm-danger disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
        {resetting && (
          <div className="animate-fade-up mt-3 flex items-center justify-end gap-2">
            <input
              type="text"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="nm-input rounded-lg border-0 px-2.5 py-1.5 text-xs text-nm-heading placeholder:text-nm-soft"
            />
            <button
              onClick={handleResetPassword}
              disabled={isPending}
              className="nm-accent rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        )}
        {error && (
          <p className="animate-fade-up mt-2 text-right text-xs text-nm-danger">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
