"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublishedProfileCard } from "@/lib/public-profile";

// Directorio de EProfiles publicadas en la portada, con buscador cuando hay
// varias.
export default function ProfilesDirectory({
  profiles,
}: {
  profiles: PublishedProfileCard[];
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.career.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term)
    );
  }, [profiles, q]);

  return (
    <div>
      {profiles.length > 4 && (
        <div className="mx-auto mb-6 max-w-sm">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o carrera…"
            className="nm-input w-full rounded-xl border-0 px-4 py-2.5 text-sm text-nm-heading placeholder:text-nm-soft"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Link
            key={p.slug}
            href={`/${p.slug}`}
            className="nm-press animate-fade-up group flex items-center gap-4 rounded-2xl nm-raised p-4 text-left"
            style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full nm-inset p-1">
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt={p.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full text-lg font-bold text-nm-soft">
                  {p.fullName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-nm-heading group-hover:text-nm-accent">
                {p.fullName}
              </p>
              {p.career && (
                <p className="truncate text-sm text-nm-soft">{p.career}</p>
              )}
              <p className="mt-0.5 truncate text-xs text-nm-soft">/{p.slug}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl nm-inset px-4 py-8 text-center text-sm text-nm-soft">
          Nadie coincide con “{q}”.
        </p>
      )}
    </div>
  );
}
