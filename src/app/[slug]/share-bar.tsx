"use client";

import { useState } from "react";

type Props = {
  slug: string;
  url: string;
  name: string;
};

// Acciones de compartir en la EProfile pública: copiar enlace, compartir con
// el menú nativo del dispositivo, descargar el QR y abrir el CV para imprimir.
export default function ShareBar({ slug, url, name }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", url);
    }
  }

  async function nativeShare() {
    const data = { title: `${name} · EProfile`, text: `Mira la EProfile de ${name}`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* el usuario canceló */
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
      <button
        type="button"
        onClick={copyLink}
        className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading"
      >
        {copied ? "¡Enlace copiado!" : "Copiar enlace"}
      </button>
      <button
        type="button"
        onClick={nativeShare}
        className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading"
      >
        Compartir
      </button>
      <a
        href={`/api/qr/${slug}?download=1`}
        className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading"
      >
        Descargar QR
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading print:hidden"
      >
        Imprimir
      </button>
    </div>
  );
}
