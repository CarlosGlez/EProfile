// URL base pública de la plataforma (para armar el link/QR de cada EProfile).
// En desarrollo cae a localhost si no está configurada.
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function getPublicProfileUrl(slug: string): string {
  return `${getSiteUrl()}/${slug}`;
}
