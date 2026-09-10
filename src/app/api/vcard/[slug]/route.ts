import { createClient } from "@/lib/supabase/server";
import { getPublicProfileUrl } from "@/lib/site";
import { githubLink, linkedinLink } from "@/lib/contact";
import type { ProfileContent } from "@/types/profile";

function escapeVCard(value: string) {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

// GET /api/vcard/[slug] -> archivo .vcf descargable con los datos de
// contacto publicados. Solo usa información publicada (nunca borrador).
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/vcard/[slug]">
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

  const p = data.published as ProfileContent;

  const linkedin = p.contact?.linkedin ? linkedinLink(p.contact.linkedin) : null;
  const github = p.contact?.github ? githubLink(p.contact.github) : null;

  const fullName = p.fullName || slug;
  const nameParts = fullName.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const firstName = nameParts[0] ?? "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(fullName)}`,
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    p.career ? `TITLE:${escapeVCard(p.career)}` : null,
    p.career ? `ORG:${escapeVCard(p.career)}` : null,
    p.contact?.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(p.contact.email)}` : null,
    p.contact?.phone ? `TEL;TYPE=CELL:${escapeVCard(p.contact.phone)}` : null,
    `URL:${getPublicProfileUrl(slug)}`,
    linkedin ? `URL;TYPE=LinkedIn:${escapeVCard(linkedin.href)}` : null,
    github ? `URL;TYPE=GitHub:${escapeVCard(github.href)}` : null,
    p.photoUrl ? `PHOTO;VALUE=URI:${escapeVCard(p.photoUrl)}` : null,
    p.bio ? `NOTE:${escapeVCard(p.bio)}` : null,
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ].filter(Boolean);

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
    },
  });
}
