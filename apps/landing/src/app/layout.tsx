import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantic Ecosystem | Plataforma de Mentorías Empresariales",
  description:
    "Gestiona, mide y escala tu programa de mentorías con la plataforma más avanzada del mercado. Dashboards en tiempo real, seguimiento de objetivos y métricas de impacto.",
  keywords: [
    "mentoría empresarial",
    "gestión de mentores",
    "plataforma SaaS",
    "coaching empresarial",
    "desarrollo profesional",
    "Quantic",
  ],
  openGraph: {
    title: "Quantic Ecosystem | Plataforma de Mentorías Empresariales",
    description:
      "Gestiona, mide y escala tu programa de mentorías con la plataforma más avanzada del mercado.",
    type: "website",
    locale: "es_LA",
    siteName: "Quantic Ecosystem",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
