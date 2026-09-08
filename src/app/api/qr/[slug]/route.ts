import QRCode from "qrcode";
import { getPublicProfileUrl } from "@/lib/site";

// GET /api/qr/[slug] -> PNG con el QR que apunta a la EProfile pública.
// No requiere sesión: el visitante debe poder escanearlo libremente.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/qr/[slug]">
) {
  const { slug } = await params;
  const url = getPublicProfileUrl(slug);

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 1,
    color: { dark: "#18181b", light: "#ffffff" },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    },
  });
}
