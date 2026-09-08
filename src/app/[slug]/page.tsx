import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ProfileContent } from "@/types/profile";
import QrCode from "@/components/qr-code";

async function getPublicProfile(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("slug, published, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || !data.published) return null;
  return data as { slug: string; published: ProfileContent; published_at: string };
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) return { title: "EProfile no encontrada" };
  const { fullName, career } = profile.published;
  return {
    title: `${fullName || slug} · EProfile`,
    description: career || "Tarjeta de presentación digital",
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/[slug]">) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if (!profile) notFound();

  const p = profile.published;
  const hasCv =
    p.cv?.formacion?.length || p.cv?.experiencia?.length || p.cv?.reconocimientos?.length;
  const hasSkills = p.skills?.length > 0;
  const hasProjects = p.projects?.length > 0;
  const hasContact = Object.values(p.contact ?? {}).some((v) => v?.trim());

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Encabezado: lo esencial primero */}
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 sm:h-32 sm:w-32">
            {p.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photoUrl}
                alt={p.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-400">
                {(p.fullName || slug).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              {p.fullName || slug}
            </h1>
            {p.career && (
              <p className="mt-1 text-base font-medium text-zinc-600">
                {p.career}
              </p>
            )}
            {p.bio && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
                {p.bio}
              </p>
            )}
          </div>
        </header>

        {/* Acciones rápidas */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
          <a
            href={`/api/cv/${slug}`}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Descargar CV (PDF)
          </a>
          <a
            href={`/api/vcard/${slug}`}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            Guardar contacto
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-8 sm:col-span-2">
            {hasCv ? (
              <Section title="Currículum">
                {p.cv.formacion?.length > 0 && (
                  <SubSection title="Formación">
                    <ul className="space-y-3">
                      {p.cv.formacion.map((f, i) => (
                        <li key={i}>
                          <p className="font-medium text-zinc-900">{f.titulo}</p>
                          <p className="text-sm text-zinc-500">
                            {f.institucion}
                            {f.periodo ? ` · ${f.periodo}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </SubSection>
                )}
                {p.cv.experiencia?.length > 0 && (
                  <SubSection title="Experiencia">
                    <ul className="space-y-3">
                      {p.cv.experiencia.map((e, i) => (
                        <li key={i}>
                          <p className="font-medium text-zinc-900">
                            {e.puesto}
                            {e.organizacion ? ` · ${e.organizacion}` : ""}
                          </p>
                          <p className="text-sm text-zinc-500">{e.periodo}</p>
                          {e.descripcion && (
                            <p className="mt-1 text-sm text-zinc-600">
                              {e.descripcion}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </SubSection>
                )}
                {p.cv.reconocimientos?.length > 0 && (
                  <SubSection title="Reconocimientos">
                    <ul className="space-y-2">
                      {p.cv.reconocimientos.map((r, i) => (
                        <li key={i} className="text-sm text-zinc-700">
                          <span className="font-medium">{r.titulo}</span>
                          {r.detalle ? ` — ${r.detalle}` : ""}
                        </li>
                      ))}
                    </ul>
                  </SubSection>
                )}
              </Section>
            ) : null}

            {hasProjects && (
              <Section title="Proyectos">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {p.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-zinc-200 bg-white p-4"
                    >
                      <p className="font-semibold text-zinc-900">{proj.name}</p>
                      {proj.role && (
                        <p className="text-xs font-medium text-zinc-500">
                          {proj.role}
                        </p>
                      )}
                      {proj.description && (
                        <p className="mt-2 text-sm text-zinc-600">
                          {proj.description}
                        </p>
                      )}
                      {proj.tech && (
                        <p className="mt-2 text-xs text-zinc-500">
                          {proj.tech}
                        </p>
                      )}
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-sm font-medium text-zinc-900 underline"
                        >
                          Ver proyecto →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {hasSkills && (
              <Section title="Habilidades">
                <div className="space-y-3">
                  {p.skills.map((group, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {group.category}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {group.items.map((item, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            {hasContact && (
              <Section title="Contacto">
                <ul className="space-y-2 text-sm">
                  {p.contact.email && (
                    <li>
                      <a
                        href={`mailto:${p.contact.email}`}
                        className="text-zinc-700 hover:underline"
                      >
                        {p.contact.email}
                      </a>
                    </li>
                  )}
                  {p.contact.phone && (
                    <li className="text-zinc-700">{p.contact.phone}</li>
                  )}
                  {p.contact.linkedin && (
                    <li>
                      <a
                        href={p.contact.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-700 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </li>
                  )}
                  {p.contact.github && (
                    <li>
                      <a
                        href={p.contact.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-700 hover:underline"
                      >
                        GitHub
                      </a>
                    </li>
                  )}
                </ul>
              </Section>
            )}

            <Section title="Tarjeta digital">
              <div className="flex flex-col items-center gap-2">
                <QrCode slug={slug} size={160} />
                <p className="text-center text-xs text-zinc-500">
                  Escanea para volver a esta EProfile
                </p>
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-900">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="mb-2 text-xs font-semibold text-zinc-500">{title}</h3>
      {children}
    </div>
  );
}
