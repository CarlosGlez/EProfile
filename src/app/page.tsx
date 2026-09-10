import Link from "next/link";
import { listPublishedProfiles } from "@/lib/public-profile";
import ProfilesDirectory from "./profiles-directory";

export default async function Home() {
  const profiles = await listPublishedProfiles();

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
        className="animate-blob pointer-events-none absolute -right-28 top-52 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(23,166,115,0.3), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
        {/* Hero */}
        <div className="text-center">
          <div className="animate-scale-in mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl nm-raised animate-float">
            <span className="bg-gradient-to-br from-nm-accent to-[var(--nm-accent-2)] bg-clip-text text-3xl font-black text-transparent">
              E
            </span>
          </div>

          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-nm-soft">
            Proyecto integrador · Nuevas Tecnologías
          </p>
          <h1
            className="animate-fade-up mt-3 text-3xl font-bold text-nm-heading sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            Plataforma EProfile
          </h1>
          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-base leading-relaxed text-nm-soft"
            style={{ animationDelay: "120ms" }}
          >
            Tarjeta de presentación digital: un sitio siempre actualizado con tu
            perfil, currículum, proyectos y contacto, compartible con un enlace
            fijo y un código QR.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/login"
              className="nm-accent w-full rounded-2xl px-6 py-3 text-sm font-semibold sm:w-auto"
            >
              Entrar a mi panel
            </Link>
            {profiles.length > 0 && (
              <a
                href="#directorio"
                className="nm-raised-sm nm-press w-full rounded-2xl px-6 py-3 text-sm font-semibold text-nm-heading sm:w-auto"
              >
                Ver EProfiles publicadas
              </a>
            )}
          </div>
        </div>

        {/* Cómo funciona */}
        <div
          className="animate-fade-up mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          style={{ animationDelay: "240ms" }}
        >
          <Step
            n={1}
            title="Llena tu perfil"
            text="Foto, carrera, reseña, CV, proyectos, habilidades y contacto desde tu panel."
          />
          <Step
            n={2}
            title="Publica"
            text="Guardas un borrador, previsualizas y publicas cuando esté lista."
          />
          <Step
            n={3}
            title="Comparte"
            text="Un enlace fijo /tu-usuario, un QR y tu CV en PDF siempre al día."
          />
        </div>

        {/* Directorio de EProfiles publicadas */}
        <section id="directorio" className="mt-20 scroll-mt-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-nm-heading">
              EProfiles publicadas
            </h2>
            {profiles.length > 0 && (
              <span className="text-sm text-nm-soft">
                {profiles.length}{" "}
                {profiles.length === 1 ? "perfil" : "perfiles"}
              </span>
            )}
          </div>

          {profiles.length > 0 ? (
            <ProfilesDirectory profiles={profiles} />
          ) : (
            <div className="rounded-3xl nm-raised p-10 text-center">
              <p className="text-sm text-nm-soft">
                Todavía no hay EProfiles publicadas. Cuando un estudiante
                publique la suya, aparecerá aquí.
              </p>
            </div>
          )}
        </section>

        <p className="animate-fade-in mt-16 text-center text-xs text-nm-soft">
          ¿Buscas la EProfile de alguien? Abre su enlace directo, por ejemplo{" "}
          <code className="nm-inset rounded-lg px-1.5 py-0.5 font-mono text-nm-heading">
            /nombre-de-usuario
          </code>
          .
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="rounded-2xl nm-raised p-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full nm-inset text-sm font-bold text-nm-accent">
        {n}
      </span>
      <p className="mt-3 font-bold text-nm-heading">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-nm-soft">{text}</p>
    </div>
  );
}
