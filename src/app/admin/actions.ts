"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesión activa.");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleRow?.role !== "admin_plataforma") {
    throw new Error("Solo un administrador de plataforma puede hacer esto.");
  }

  return user;
}

export interface CreateStudentState {
  error: string | null;
  success: string | null;
}

export async function createStudentAction(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  try {
    await requireAdmin();

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const slug = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase();

    if (!email || !password || !slug) {
      return { error: "Completa correo, contraseña y ruta.", success: null };
    }
    if (!/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
      return {
        error:
          "La ruta solo puede tener minúsculas, números y guiones (3-40 caracteres).",
        success: null,
      };
    }
    if (password.length < 8) {
      return {
        error: "La contraseña debe tener al menos 8 caracteres.",
        success: null,
      };
    }

    const admin = createAdminClient();

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !created.user) {
      return {
        error: createError?.message ?? "No se pudo crear la cuenta.",
        success: null,
      };
    }

    const { error: roleError } = await admin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "estudiante" });

    if (roleError) {
      return { error: roleError.message, success: null };
    }

    const { error: studentError } = await admin
      .from("students")
      .insert({ id: created.user.id, slug });

    if (studentError) {
      return { error: studentError.message, success: null };
    }

    revalidatePath("/admin");
    return {
      error: null,
      success: `Cuenta creada: ${email} → eprofile.com/${slug}`,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error inesperado.",
      success: null,
    };
  }
}

export async function toggleStudentActiveAction(
  studentId: string,
  active: boolean
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("students")
    .update({ active })
    .eq("id", studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteStudentAction(studentId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function resetPasswordAction(
  studentId: string,
  newPassword: string
) {
  await requireAdmin();
  if (newPassword.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(studentId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
