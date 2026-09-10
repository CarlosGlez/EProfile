// Normaliza lo que el estudiante escribió en los campos de contacto. Puede
// haber puesto una URL completa, un dominio sin protocolo o solo su usuario;
// aquí lo convertimos en un enlace utilizable y en una etiqueta legible.

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

// LinkedIn: acepta URL completa, "linkedin.com/in/xxx" o solo "xxx".
export function linkedinLink(raw: string): { href: string; label: string } | null {
  const value = raw.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return { href: value, label: stripProtocol(value) };
  }
  if (/linkedin\.com/i.test(value)) {
    return { href: `https://${stripProtocol(value)}`, label: stripProtocol(value) };
  }
  const handle = value.replace(/^\/?(in\/)?/i, "").replace(/\/+$/, "");
  return {
    href: `https://www.linkedin.com/in/${handle}`,
    label: `linkedin.com/in/${handle}`,
  };
}

// GitHub: acepta URL completa, "github.com/xxx" o solo "xxx".
export function githubLink(raw: string): { href: string; label: string } | null {
  const value = raw.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return { href: value, label: stripProtocol(value) };
  }
  if (/github\.com/i.test(value)) {
    return { href: `https://${stripProtocol(value)}`, label: stripProtocol(value) };
  }
  const handle = value.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  return { href: `https://github.com/${handle}`, label: `github.com/${handle}` };
}

// Teléfono: deja solo lo marcable para el href de tel:
export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^\d+]/g, "")}`;
}
