"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionInfo } from "@/lib/auth";

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase signInWithPassword error:", {
      message: error.message,
      status: error.status,
      code: (error as { code?: string }).code,
    });
    return { error: "Correo o contraseña incorrectos." };
  }

  const session = await getSessionInfo();

  if (!session) {
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no tiene un rol asignado en la plataforma. Contacta al administrador.",
    };
  }

  const defaultDestination =
    session.role === "admin_plataforma" ? "/admin" : `/${session.slug}/admin`;

  redirect(next && next.startsWith("/") ? next : defaultDestination);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
