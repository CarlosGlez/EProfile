import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="animate-scale-in w-full max-w-sm rounded-3xl nm-raised p-8">
        <Link
          href="/"
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl nm-raised-sm nm-press"
        >
          <span className="bg-gradient-to-br from-nm-accent to-[var(--nm-accent-2)] bg-clip-text text-xl font-black text-transparent">
            E
          </span>
        </Link>
        <h1 className="text-xl font-bold text-nm-heading">Entrar a EProfile</h1>
        <p className="mt-1 text-sm text-nm-soft">
          Estudiantes y administradores de plataforma.
        </p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
