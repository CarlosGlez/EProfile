import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionInfo } from "@/lib/auth";
import { emptyProfileContent, type ProfileContent } from "@/types/profile";
import ProfileEditor from "./profile-editor";

export default async function StudentAdminPage({
  params,
}: PageProps<"/[slug]/admin">) {
  const { slug } = await params;
  const session = await getSessionInfo();

  if (!session) redirect(`/login?next=/${slug}/admin`);

  const isAdmin = session.role === "admin_plataforma";
  const isOwner = session.role === "estudiante" && session.slug === slug;

  if (!isAdmin && !isOwner) {
    // Un estudiante no puede entrar al panel de otro.
    redirect(`/${session.role === "estudiante" ? session.slug + "/admin" : "admin"}`);
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, slug, active")
    .eq("slug", slug)
    .maybeSingle();

  if (!student) notFound();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("status, draft, published, published_at")
    .eq("student_id", student.id)
    .maybeSingle();

  const draft: ProfileContent = {
    ...emptyProfileContent(),
    ...(profileRow?.draft as Partial<ProfileContent> | undefined),
  };

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Panel de {slug}
            </h1>
            <p className="text-sm text-zinc-500">
              {isAdmin && !isOwner
                ? "Estás editando este perfil como administrador."
                : "Edita tu información, guarda un borrador y publica cuando esté lista."}
            </p>
          </div>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Ver EProfile pública ↗
          </a>
        </div>

        <ProfileEditor
          slug={slug}
          initialContent={draft}
          status={profileRow?.status ?? "borrador"}
          publishedAt={profileRow?.published_at ?? null}
        />
      </div>
    </div>
  );
}
