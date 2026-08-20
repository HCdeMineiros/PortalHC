"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Paciente", href: "/paciente/acesso" },
  { rotulo: "Área Médica", href: "/medico" },
  { rotulo: "Acesso da Equipe", href: "/medico/login" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [aberto, setAberto] = useState(false);

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
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="Portal HC — início" className="flex-none">
          <Logo height={46} />
        </Link>

        {/* nav desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.rotulo}
              href={n.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--hc-ink-soft)] transition-colors hover:bg-[var(--hc-cream-2)] hover:text-[var(--hc-red-600)]"
            >
              {n.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/paciente/acesso"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(160,12,34,.7)] transition-all hover:brightness-105 sm:inline-flex"
          >
            Acessar Portal
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <button
            onClick={() => setAberto((v) => !v)}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--hc-line)] bg-white text-[var(--hc-ink)] lg:hidden"
          >
            {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* menu mobile */}
      {aberto && (
        <div className="border-t border-[var(--hc-line)] bg-[var(--hc-cream)] lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4" aria-label="Menu mobile">
            {NAV.map((n) => (
              <Link
                key={n.rotulo}
                href={n.href}
                onClick={() => setAberto(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-[var(--hc-ink)] hover:bg-white"
              >
                {n.rotulo}
              </Link>
            ))}
            <Link
              href="/paciente/acesso"
              onClick={() => setAberto(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-5 py-3 text-base font-semibold text-white"
            >
              Acessar Portal <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
