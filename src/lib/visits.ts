import { createClient } from "@/lib/supabase/server";

// Registra una visita a una EProfile pública. Nunca lanza: la analítica es
// secundaria y no debe tumbar la página si la migración aún no se ejecutó.
export async function registerVisit(slug: string, referrer: string | null) {
  try {
    const supabase = await createClient();
    await supabase.rpc("register_profile_visit", {
      p_slug: slug,
      p_referrer: referrer,
    });
  } catch {
    // Ignorado a propósito.
  }
}

export interface VisitStats {
  total: number;
  last30: number;
  last7: number;
  available: boolean;
}

// Conteo de visitas para el panel del estudiante / admin. Si la tabla no
// existe todavía (`available: false`), el panel lo indica en vez de romperse.
export async function getVisitStats(studentId: string): Promise<VisitStats> {
  const empty: VisitStats = {
    total: 0,
    last30: 0,
    last7: 0,
    available: false,
  };

  try {
    const supabase = await createClient();
    const now = Date.now();
    const d30 = new Date(now - 30 * 864e5).toISOString();
    const d7 = new Date(now - 7 * 864e5).toISOString();

    const base = () =>
      supabase
        .from("profile_visits")
        .select("*", { count: "exact", head: true })
        .eq("student_id", studentId);

    const [all, m30, m7] = await Promise.all([
      base(),
      base().gte("visited_at", d30),
      base().gte("visited_at", d7),
    ]);

    if (all.error) return empty;

    return {
      total: all.count ?? 0,
      last30: m30.count ?? 0,
      last7: m7.count ?? 0,
      available: true,
    };
  } catch {
    return empty;
  }
}
