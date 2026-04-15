import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gunpla AI Forge",
  description: "Sistema Multi-Agente para diseño de maquetas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}