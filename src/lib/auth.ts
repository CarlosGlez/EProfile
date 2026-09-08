import { createClient } from "@/lib/supabase/server";

export type SessionInfo =
  | { role: "admin_plataforma"; userId: string; email: string | null }
  | { role: "estudiante"; userId: string; email: string | null; slug: string }
  | null;

// Devuelve el rol y datos básicos del usuario autenticado actual, o null si
// no hay sesión. Se usa para decidir a dónde redirigir tras login y para
// proteger contenido dentro de las páginas de servidor.
export async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleRow?.role === "admin_plataforma") {
    return { role: "admin_plataforma", userId: user.id, email: user.email ?? null };
  }

  const { data: studentRow } = await supabase
    .from("students")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  if (studentRow) {
    return {
      role: "estudiante",
      userId: user.id,
      email: user.email ?? null,
      slug: studentRow.slug,
    };
  }

  return null;
}
