import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/logout-button";
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
    <div className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="animate-fade-up flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-nm-heading">
              Panel de plataforma
            </h1>
            <p className="mt-1 text-sm text-nm-soft">
              Crea cuentas de estudiantes y gestiona sus perfiles.
            </p>
            {session.email && (
              <p className="mt-1 text-xs text-nm-soft">
                Sesión: <span className="font-medium">{session.email}</span>
              </p>
            )}
          </div>
          <LogoutButton />
        </header>

        <div
          className="animate-fade-up mt-6"
          style={{ animationDelay: "80ms" }}
        >
          <CreateStudentForm />
        </div>

        <div
          className="animate-fade-up mt-8 overflow-hidden rounded-3xl nm-raised"
          style={{ animationDelay: "140ms" }}
        >
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
                {rows.map((r, i) => (
                  <StudentRow key={r.id} row={r} index={i} />
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-nm-soft"
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
    </div>
  );
}
