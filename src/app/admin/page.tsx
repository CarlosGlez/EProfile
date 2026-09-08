import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CreateStudentForm from "./create-student-form";
import StudentRow from "./student-row";

export default async function AdminPage() {
  const session = await getSessionInfo();

  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin_plataforma") {
    redirect(`/${session.slug}/admin`);
  }

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, slug, active, created_at, profiles(status, published_at)")
    .order("created_at", { ascending: false });

  let emailById = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data: usersPage } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    emailById = new Map(
      (usersPage?.users ?? []).map((u) => [u.id, u.email ?? ""])
    );
  } catch {
    // Si falta la Service Role Key en el entorno, seguimos sin mostrar
    // el correo en vez de romper la página.
  }

  const rows = (students ?? []).map((s) => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    return {
      id: s.id,
      slug: s.slug,
      active: s.active,
      email: emailById.get(s.id) ?? "",
      status: profile?.status ?? "borrador",
      publishedAt: profile?.published_at ?? null,
    };
  });

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <h1 className="text-xl font-bold text-zinc-900">
          Panel de plataforma
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crea cuentas de estudiantes y gestiona sus perfiles.
        </p>

        <div className="mt-6">
          <CreateStudentForm />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Ruta</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Estado del perfil</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <StudentRow key={r.id} row={r} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-zinc-400"
                  >
                    Aún no hay estudiantes registrados.
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
