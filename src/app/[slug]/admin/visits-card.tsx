import type { VisitStats } from "@/lib/visits";

// Tarjeta de analítica en el panel: cuántas veces se ha abierto la EProfile
// pública. Si la migración de `profile_visits` aún no corre, lo indica.
export default function VisitsCard({
  slug,
  stats,
}: {
  slug: string;
  stats: VisitStats;
}) {
  return (
    <div className="rounded-2xl nm-raised p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-nm-heading">
        Visitas a /{slug}
      </h2>

      {stats.available ? (
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Últimos 7 días" value={stats.last7} />
          <Stat label="Últimos 30 días" value={stats.last30} />
          <Stat label="Total" value={stats.total} />
        </div>
      ) : (
        <p className="nm-inset rounded-xl px-3 py-2 text-xs text-nm-soft">
          Para ver las visitas, ejecuta el bloque de analítica de{" "}
          <span className="font-mono">supabase/schema.sql</span> (sección 7) en
          el SQL Editor de Supabase.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl nm-inset px-2 py-3">
      <p className="text-xl font-bold text-nm-heading">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-nm-soft">{label}</p>
    </div>
  );
}
