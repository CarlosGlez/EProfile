import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la Service Role Key: solo se usa en Server Actions / Route
// Handlers para operaciones administrativas (crear/eliminar cuentas de
// estudiantes, resetear contraseñas). NUNCA se debe importar en código de
// cliente ni exponer esta llave al navegador.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
