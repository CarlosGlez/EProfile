import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="animate-scale-in mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl nm-raised animate-float">
          <span className="bg-gradient-to-br from-nm-accent to-[var(--nm-accent-2)] bg-clip-text text-3xl font-black text-transparent">
            E
          </span>
        </div>

        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-nm-soft">
          Proyecto integrador · Nuevas Tecnologías
        </p>
        <h1
          className="animate-fade-up mt-3 text-3xl font-bold text-nm-heading sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          Plataforma EProfile
        </h1>
        <p
          className="animate-fade-up mt-4 text-base leading-relaxed text-nm-soft"
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
        </div>

        <p
          className="animate-fade-up mt-8 text-xs text-nm-soft"
          style={{ animationDelay: "240ms" }}
        >
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
