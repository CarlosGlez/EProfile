import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="animate-scale-in w-full max-w-md rounded-3xl nm-raised p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl nm-inset">
          <span className="text-2xl font-black text-nm-soft">404</span>
        </div>
        <h1 className="text-xl font-bold text-nm-heading">
          Esta EProfile no existe
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-nm-soft">
          El enlace puede estar mal escrito, la cuenta fue desactivada o el
          estudiante todavía no publica su perfil.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="nm-accent rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="nm-raised-sm nm-press rounded-xl px-5 py-2.5 text-sm font-semibold text-nm-heading"
          >
            Entrar a mi panel
          </Link>
        </div>
      </div>
    </div>
  );
}
