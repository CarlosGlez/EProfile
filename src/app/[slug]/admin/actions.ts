"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete, type ProfileContent } from "@/types/profile";

async function authorizeStudentEdit(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesión activa.");

  const { data: student } = await supabase
    .from("students")
    .select("id, slug, active")
    .eq("slug", slug)
    .maybeSingle();

  if (!student) throw new Error("Estudiante no encontrado.");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = roleRow?.role === "admin_plataforma";
  const isOwner = student.id === user.id;

  if (!isAdmin && !isOwner) {
    throw new Error("No tienes permiso para editar este perfil.");
  }

  return { supabase, studentId: student.id as string };
}

export async function saveDraftAction(slug: string, content: ProfileContent) {
  const { supabase, studentId } = await authorizeStudentEdit(slug);

  const { error } = await supabase
    .from("profiles")
    .update({ draft: content })
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}/admin`);
  return { ok: true };
}

export async function publishAction(slug: string, content: ProfileContent) {
  const { supabase, studentId } = await authorizeStudentEdit(slug);

  if (!isProfileComplete(content)) {
    throw new Error(
      "No se puede publicar: se necesita al menos nombre y carrera."
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      draft: content,
      published: content,
      status: "publicado",
      published_at: new Date().toISOString(),
    })
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

export async function uploadPhotoAction(slug: string, formData: FormData) {
  const { supabase, studentId } = await authorizeStudentEdit(slug);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No se recibió ningún archivo.");
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("La imagen debe pesar menos de 4 MB.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${studentId}/photo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl };
}
