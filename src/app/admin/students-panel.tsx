"use client";

import { useMemo, useState } from "react";
import StudentRow, { type StudentRowData } from "./student-row";

// Resumen + buscador sobre la lista de estudiantes del panel de plataforma.
export default function StudentsPanel({ rows }: { rows: StudentRowData[] }) {
  const [q, setQ] = useState("");

  const stats = useMemo(() => {
    return {
      total: rows.length,
      publicados: rows.filter((r) => r.status === "publicado").length,
      borradores: rows.filter((r) => r.status === "borrador").length,
      inactivos: rows.filter((r) => !r.active).length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.slug.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term)
    );
  }, [rows, q]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Estudiantes" value={stats.total} />
        <StatCard label="Publicados" value={stats.publicados} tone="ok" />
        <StatCard label="En borrador" value={stats.borradores} tone="warn" />
        <StatCard label="Desactivados" value={stats.inactivos} tone="danger" />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl nm-raised">
        <div className="border-b border-white/40 p-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ruta o correo…"
            className="nm-input w-full rounded-xl border-0 px-3.5 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft sm:max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-nm-soft">
              <tr>
                <th className="px-5 py-4">Ruta</th>
                <th className="px-5 py-4">Correo</th>
                <th className="px-5 py-4">Estado del perfil</th>
                <th className="px-5 py-4">Cuenta</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <StudentRow key={r.id} row={r} index={i} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-nm-soft"
                  >
                    {rows.length === 0
                      ? "Aún no hay estudiantes registrados."
                      : "Ningún estudiante coincide con la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  const color =
    tone === "ok"
      ? "text-nm-ok"
      : tone === "warn"
        ? "text-[#c98a1b]"
        : tone === "danger"
          ? "text-nm-danger"
          : "text-nm-heading";
  return (
    <div className="rounded-2xl nm-raised-sm px-4 py-3">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-nm-soft">{label}</p>
    </div>
  );
}
