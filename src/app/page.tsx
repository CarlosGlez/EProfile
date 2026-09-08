import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Proyecto integrador · Nuevas Tecnologías
        </p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-900 sm:text-4xl">
          Plataforma EProfile
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          Tarjeta de presentación digital: un sitio siempre actualizado con
          tu perfil, currículum, proyectos y contacto, compartible con un
          enlace fijo y un código QR.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Entrar a mi panel
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-400">
          ¿Buscas la EProfile de alguien? Abre su enlace directo, por
          ejemplo <code className="rounded bg-zinc-100 px-1.5 py-0.5">/nombre-de-usuario</code>.
        </p>
      </div>
    </div>
  );
}
