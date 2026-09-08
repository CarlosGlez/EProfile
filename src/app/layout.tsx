import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EProfile — tarjeta de presentación digital",
  description:
    "Plataforma de EProfiles: tu CV, proyectos y contacto siempre actualizados en un solo lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
