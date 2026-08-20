import Link from "next/link";
import { Stethoscope, ClipboardList, LayoutGrid, ArrowRight } from "lucide-react";

const RECURSOS = [
  { icon: LayoutGrid, texto: "Catálogo de procedimentos para agilizar o cadastro" },
  { icon: ClipboardList, texto: "Cirurgias e internações organizadas por solicitação" },
  { icon: Stethoscope, texto: "Acompanhamento das etapas junto à equipe do HC" },
];

export function MedicalSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--hc-ink)] text-[var(--hc-cream)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--hc-gold),transparent_60%)]" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--hc-red),transparent_60%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hc-gold)]/40 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold)]">
            Corpo clínico
          </span>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            Uma área dedicada aos médicos do HC
          </h2>
          <p className="mt-4 max-w-lg text-[color-mix(in_srgb,var(--hc-cream)_82%,transparent)]">
            Registre cirurgias e internações particulares de forma simples e acompanhe cada
            solicitação até a assinatura do paciente.
          </p>

          <ul className="mt-8 space-y-3">
            {RECURSOS.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10 text-[var(--hc-gold)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm text-[color-mix(in_srgb,var(--hc-cream)_88%,transparent)]">{texto}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/medico"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--hc-cream)] px-7 py-3.5 text-base font-semibold text-[var(--hc-ink)] transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            Entrar na Área Médica
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>

        {/* card decorativo */}
        <div className="relative hidden lg:block">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white">
                <Stethoscope className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold text-[var(--hc-cream)]">Área do Médico</span>
                <span className="block text-xs text-[color-mix(in_srgb,var(--hc-cream)_70%,transparent)]">Cadastro e acompanhamento</span>
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {["Nova cirurgia", "Nova internação clínica", "Minhas solicitações"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--hc-cream)]">
                  {t}
                  <ArrowRight className="h-4 w-4 text-[var(--hc-gold)]" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
