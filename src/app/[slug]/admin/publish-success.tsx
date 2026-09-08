"use client";

import { useEffect } from "react";
import Link from "next/link";

const CONFETTI = [
  { cx: "-120px", color: "#6d5efc", delay: "0s", left: "18%" },
  { cx: "90px", color: "#17a673", delay: "0.05s", left: "30%" },
  { cx: "-60px", color: "#f0a020", delay: "0.12s", left: "44%" },
  { cx: "140px", color: "#e5484d", delay: "0.08s", left: "56%" },
  { cx: "-100px", color: "#8b7bff", delay: "0.16s", left: "68%" },
  { cx: "70px", color: "#17a673", delay: "0.02s", left: "80%" },
  { cx: "-40px", color: "#6d5efc", delay: "0.2s", left: "24%" },
  { cx: "110px", color: "#f0a020", delay: "0.14s", left: "74%" },
];

type Props = {
  slug: string;
  onClose: () => void;
};

// Overlay de confirmación tras publicar el perfil: check animado, ráfaga de
// confeti y accesos directos. Se cierra con Escape, al hacer clic fuera o con
// los botones.
export default function PublishSuccess({ slug, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Perfil publicado"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-0 max-w-md">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute block h-2.5 w-2.5 rounded-[2px]"
            style={{
              left: c.left,
              background: c.color,
              // @ts-expect-error CSS custom property
              "--nm-cx": c.cx,
              animation: `nm-confetti 1.1s ease-out ${c.delay} forwards`,
            }}
          />
        ))}
      </div>

      <div
        className="animate-pop relative w-full max-w-sm rounded-3xl nm-raised p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto mb-5 h-20 w-20">
          <span
            className="absolute inset-0 rounded-full bg-nm-ok/30"
            style={{ animation: "nm-ring 1s ease-out 0.15s both" }}
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full nm-raised">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M11 20.5L17 26.5L29 13.5"
                stroke="#17a673"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: 40,
                  animation: "nm-check 0.5s ease-out 0.35s forwards",
                }}
              />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-bold text-nm-heading">¡Perfil publicado!</h2>
        <p className="mt-1.5 text-sm text-nm-soft">
          Tu EProfile ya es visible en público en{" "}
          <span className="font-medium text-nm-heading">/{slug}</span>.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={`/${slug}`}
            target="_blank"
            className="nm-accent rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Ver mi EProfile pública ↗
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="nm-raised-sm nm-press rounded-xl px-4 py-2.5 text-sm font-semibold text-nm-heading"
          >
            Seguir editando
          </button>
        </div>
      </div>
    </div>
  );
}
