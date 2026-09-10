import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/public-profile";

export const alt = "EProfile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen que se ve al compartir el enlace de una EProfile en redes / mensajería.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  const name = profile?.published.fullName || slug;
  const career = profile?.published.career || "Tarjeta de presentación digital";
  const initial = (name || "E").slice(0, 1).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #e9ecf3 0%, #dfe3ec 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8b7bff, #6d5efc)",
              color: "#fff",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            E
          </div>
          <span style={{ fontSize: 30, color: "#7b8296", fontWeight: 700 }}>
            EProfile
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e6e9f0",
              border: "10px solid #fff",
              boxShadow: "0 30px 60px rgba(109,94,252,0.25)",
              color: "#6d5efc",
              fontSize: 110,
              fontWeight: 900,
            }}
          >
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <span
              style={{ fontSize: 68, fontWeight: 900, color: "#2f3548", lineHeight: 1.1 }}
            >
              {name}
            </span>
            <span style={{ fontSize: 38, color: "#6d5efc", marginTop: 16, fontWeight: 700 }}>
              {career}
            </span>
          </div>
        </div>

        <span style={{ fontSize: 28, color: "#7b8296" }}>
          /{slug}
        </span>
      </div>
    ),
    { ...size }
  );
}
