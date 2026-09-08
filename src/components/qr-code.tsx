import Image from "next/image";

// Renderiza el QR pidiéndolo al endpoint /api/qr/[slug] (se genera en el
// servidor con la librería `qrcode`, como PNG). Es un <img> normal para que
// funcione igual en la vista pública, en la tarjeta imprimible y al
// descargarlo.
export default function QrCode({
  slug,
  size = 200,
}: {
  slug: string;
  size?: number;
}) {
  return (
    <Image
      src={`/api/qr/${slug}`}
      alt={`Código QR de la EProfile ${slug}`}
      width={size}
      height={size}
      unoptimized
      className="rounded-lg border border-zinc-200 bg-white p-2"
    />
  );
}
