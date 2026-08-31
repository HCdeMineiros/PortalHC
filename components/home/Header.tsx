"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, Building2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--hc-line)] bg-[color-mix(in_srgb,var(--hc-cream)_88%,white)]/90 shadow-[0_6px_24px_-16px_rgba(26,22,22,.35)] backdrop-blur-md"
          : "border-b border-transparent bg-[color-mix(in_srgb,var(--hc-cream)_70%,white)]/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex min-h-24 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <Link href="/" aria-label="Portal HC — início" className="flex-none">
          <span className="sm:hidden">
            <Logo height={42} />
          </span>
          <span className="hidden sm:block">
            <Logo height={64} />
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/medico"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(160,12,34,.7)] transition-all hover:-translate-y-0.5 hover:brightness-105 sm:px-5"
          >
            <Stethoscope className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Área Médica</span>
            <span className="sm:hidden">Médico</span>
          </Link>
          <Link
            href="/equipe"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(160,12,34,.7)] transition-all hover:-translate-y-0.5 hover:brightness-105 sm:px-5"
          >
            <Building2 className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Acesso da Equipe</span>
            <span className="sm:hidden">Equipe</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
