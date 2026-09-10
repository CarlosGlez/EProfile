import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { emptyProfileContent, type ProfileContent } from "@/types/profile";

export interface PublicProfile {
  slug: string;
  published: ProfileContent;
  published_at: string;
}

// Lectura de una EProfile pública (solo contenido publicado, de la vista
// `public_profiles`). Se memoiza por request con React.cache para que la
// página, sus metadatos y la imagen OpenGraph no repitan la consulta.
export const getPublicProfile = cache(
  async (slug: string): Promise<PublicProfile | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("public_profiles")
      .select("slug, published, published_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!data || !data.published) return null;

    return {
      slug: data.slug,
      published: {
        ...emptyProfileContent(),
        ...(data.published as Partial<ProfileContent>),
      },
      published_at: data.published_at as string,
    };
  }
);

// Lista de slugs con perfil publicado (para el sitemap).
export const listPublishedSlugs = cache(async (): Promise<
  { slug: string; published_at: string | null }[]
> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("slug, published_at");
  return data ?? [];
});
