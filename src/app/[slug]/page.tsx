import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import QrCode from "@/components/qr-code";
import ShareBar from "./share-bar";
import { getPublicProfile } from "@/lib/public-profile";
import { getPublicProfileUrl } from "@/lib/site";
import { registerVisit } from "@/lib/visits";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) return { title: "EProfile no encontrada" };
  const { fullName, career, bio } = profile.published;
  const title = `${fullName || slug} · EProfile`;
  const description =
    bio?.trim() || career || "Tarjeta de presentación digital";
  const url = getPublicProfileUrl(slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/[slug]">) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if (!profile) notFound();

  const referrer = (await headers()).get("referer");
  await registerVisit(slug, referrer);

  const p = profile.published;
  const hasCv =
    p.cv?.formacion?.length || p.cv?.experiencia?.length || p.cv?.reconocimientos?.length;
  const hasSkills = p.skills?.length > 0;
  const hasProjects = p.projects?.length > 0;
  const hasContact = Object.values(p.contact ?? {}).some((v) => v?.trim());

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Blobs decorativos de fondo */}
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(109,94,252,0.35), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -right-28 top-40 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(23,166,115,0.3), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Encabezado */}
        <header className="animate-fade-up rounded-3xl nm-raised p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-nm-accent/40 to-[var(--nm-accent-2)]/10 blur-md" />
              <div className="relative h-28 w-28 overflow-hidden rounded-full nm-inset p-1.5 sm:h-32 sm:w-32">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt={p.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full text-3xl font-bold text-nm-soft">
                    {(p.fullName || slug).slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-nm-heading sm:text-3xl">
                {p.fullName || slug}
              </h1>
              {p.career && (
                <p className="mt-1 bg-gradient-to-r from-nm-accent to-[var(--nm-accent-2)] bg-clip-text text-base font-semibold text-transparent">
                  {p.career}
                </p>
              )}
              {p.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-nm-soft">
                  {p.bio}
                </p>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:justify-start">
            <a
              href={`/api/cv/${slug}`}
              className="nm-accent rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Descargar CV (PDF)
            </a>
            <a
              href={`/api/vcard/${slug}`}
              className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading"
            >
              Guardar contacto
            </a>
          </div>

          <ShareBar
            slug={slug}
            url={getPublicProfileUrl(slug)}
            name={p.fullName || slug}
          />
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-6 sm:col-span-2">
            {hasCv ? (
              <Section title="Currículum" delay={80}>
                {p.cv.formacion?.length > 0 && (
                  <SubSection title="Formación">
                    <ul className="space-y-3">
                      {p.cv.formacion.map((f, i) => (
                        <li key={i} className="border-l-2 border-nm-accent/30 pl-3">
                          <p className="font-semibold text-nm-heading">{f.titulo}</p>
                          <p className="text-sm text-nm-soft">
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
                        <li key={i} className="border-l-2 border-nm-accent/30 pl-3">
                          <p className="font-semibold text-nm-heading">
                            {e.puesto}
                            {e.organizacion ? ` · ${e.organizacion}` : ""}
                          </p>
                          <p className="text-sm text-nm-soft">{e.periodo}</p>
                          {e.descripcion && (
                            <p className="mt-1 text-sm text-nm-soft">
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
                        <li key={i} className="text-sm text-nm-soft">
                          <span className="font-semibold text-nm-heading">
                            {r.titulo}
                          </span>
                          {r.detalle ? ` — ${r.detalle}` : ""}
                        </li>
                      ))}
                    </ul>
                  </SubSection>
                )}
              </Section>
            ) : null}

            {hasProjects && (
              <Section title="Proyectos" delay={140}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {p.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="nm-press group rounded-2xl nm-raised-sm p-4"
                    >
                      <p className="font-bold text-nm-heading">{proj.name}</p>
                      {proj.role && (
                        <p className="text-xs font-semibold text-nm-accent">
                          {proj.role}
                        </p>
                      )}
                      {proj.description && (
                        <p className="mt-2 text-sm text-nm-soft">
                          {proj.description}
                        </p>
                      )}
                      {proj.tech && (
                        <p className="mt-2 text-xs text-nm-soft">{proj.tech}</p>
                      )}
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-sm font-semibold text-nm-accent group-hover:underline"
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
              <Section title="Habilidades" delay={200}>
                <div className="space-y-4">
                  {p.skills.map((group, i) => (
                    <div key={i}>
                      <p className="text-xs font-bold uppercase tracking-wide text-nm-soft">
                        {group.category}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.items.map((item, j) => (
                          <span
                            key={j}
                            className="rounded-full nm-raised-sm px-3 py-1 text-xs font-semibold text-nm-heading"
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
              <Section title="Contacto" delay={120}>
                <ul className="space-y-2 text-sm">
                  {p.contact.email && (
                    <li>
                      <a
                        href={`mailto:${p.contact.email}`}
                        className="text-nm-soft hover:text-nm-accent"
                      >
                        {p.contact.email}
                      </a>
                    </li>
                  )}
                  {p.contact.phone && (
                    <li className="text-nm-soft">{p.contact.phone}</li>
                  )}
                  {p.contact.linkedin && (
                    <li>
                      <a
                        href={p.contact.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-nm-soft hover:text-nm-accent"
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
                        className="text-nm-soft hover:text-nm-accent"
                      >
                        GitHub
                      </a>
                    </li>
                  )}
                </ul>
              </Section>
            )}

            <Section title="Tarjeta digital" delay={180}>
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl nm-inset p-3">
                  <QrCode slug={slug} size={150} />
                </div>
                <p className="text-center text-xs text-nm-soft">
                  Escanea para volver a esta EProfile
                </p>
              </div>
            </Section>
          </aside>
        </div>

        <p className="animate-fade-in mt-10 text-center text-xs text-nm-soft">
          Hecho con EProfile · actualizado{" "}
          {new Date(profile.published_at).toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="animate-fade-up rounded-3xl nm-raised p-5 sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-nm-heading">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-nm-accent to-[var(--nm-accent-2)]" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
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
    <div className="mb-5 last:mb-0">
      <h3 className="mb-2 text-xs font-bold text-nm-soft">{title}</h3>
      {children}
    </div>
  );
}
