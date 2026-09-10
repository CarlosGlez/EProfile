import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/logout-button";
import CreateStudentForm from "./create-student-form";
import StudentsPanel from "./students-panel";

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
          className="animate-fade-up mt-8"
          style={{ animationDelay: "140ms" }}
        >
          <StudentsPanel rows={rows} />
        </div>
      </div>
    </div>
  );
}
