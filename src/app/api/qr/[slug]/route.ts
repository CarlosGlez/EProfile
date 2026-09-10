import QRCode from "qrcode";
import { getPublicProfileUrl } from "@/lib/site";

// GET /api/qr/[slug] -> QR que apunta a la EProfile pública.
// No requiere sesión: el visitante debe poder escanearlo libremente.
// Parámetros opcionales:
//   ?format=svg   devuelve el QR como SVG vectorial (ideal para imprimir)
//   ?download=1   fuerza la descarga en vez de mostrarlo en el navegador
export async function GET(
  request: Request,
  { params }: RouteContext<"/api/qr/[slug]">
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const asSvg = searchParams.get("format") === "svg";
  const download = searchParams.get("download") === "1";

  const url = getPublicProfileUrl(slug);
  const disposition = download
    ? `attachment; filename="qr-${slug}.${asSvg ? "svg" : "png"}"`
    : "inline";

  if (asSvg) {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      color: { dark: "#18181b", light: "#ffffff" },
    });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 1,
    color: { dark: "#18181b", light: "#ffffff" },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=300",
    },
  });
}
