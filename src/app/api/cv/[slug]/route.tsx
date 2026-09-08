import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { CvDocument } from "@/lib/cv-pdf";
import type { ProfileContent } from "@/types/profile";

export const runtime = "nodejs";

// GET /api/cv/[slug] -> PDF del CV, generado con la MISMA información
// publicada que se ve en la EProfile (nunca el borrador).
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/cv/[slug]">
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("public_profiles")
    .select("published")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.published) {
    return new Response("EProfile no encontrada", { status: 404 });
  }

  const profile = data.published as ProfileContent;
  const buffer = await renderToBuffer(<CvDocument profile={profile} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cv-${slug}.pdf"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
