import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { HOSPITAL } from "@/lib/brand";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${HOSPITAL.nomeCurto} — ${HOSPITAL.nome}`,
    template: `%s · ${HOSPITAL.nomeCurto}`,
  },
  description:
    "Portal de internação e cirurgia do Hospital das Clínicas de Mineiros. Leitura e assinatura eletrônica de termos de consentimento com segurança e conformidade LGPD.",
  applicationName: HOSPITAL.nomeCurto,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand/logo-hc.png", apple: "/brand/logo-hc.png" },
};

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
