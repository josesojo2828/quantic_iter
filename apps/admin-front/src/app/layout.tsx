import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/core/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantic Admin Console",
  description: "Gestión global de la plataforma Quantic SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className={`${geistSans.className} min-h-full selection:bg-cyan-500/30`}>
        {/* Aura Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px] animate-pulse [animation-delay:2s]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-accent/5 blur-[120px] animate-pulse [animation-delay:4s]" />
        </div>
        
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
