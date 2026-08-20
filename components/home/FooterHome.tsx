import Link from "next/link";
import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { HOSPITAL } from "@/lib/brand";

const PORTAL = [
  { rotulo: "Acessar como paciente", href: "/paciente/acesso" },
  { rotulo: "Área Médica", href: "/medico" },
  { rotulo: "Acesso da Equipe", href: "/medico/login" },
];

// Itens institucionais ainda sem página própria → texto, não links.
const INSTITUCIONAL = ["Sobre o hospital", "Corpo clínico", "Privacidade e LGPD"];

export function FooterHome() {
  const ano = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--hc-line)] bg-[var(--hc-cream-2)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* marca */}
        <div className="lg:col-span-1">
          <Logo height={44} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--hc-ink-soft)]">
            Os serviços digitais do Hospital das Clínicas de Mineiros, reunidos em um acesso
            seguro para pacientes e equipe.
          </p>
        </div>

        {/* portal */}
        <nav aria-label="Portal">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold-deep)]">Portal</h3>
          <ul className="mt-4 space-y-2.5">
            {PORTAL.map((l) => (
              <li key={l.rotulo}>
                <Link href={l.href} className="text-sm text-[var(--hc-ink-soft)] transition-colors hover:text-[var(--hc-red-600)]">
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* institucional (texto, sem links quebrados) */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold-deep)]">Institucional</h3>
          <ul className="mt-4 space-y-2.5">
            {INSTITUCIONAL.map((t) => (
              <li key={t} className="text-sm text-[var(--hc-ink-soft)]">{t}</li>
            ))}
          </ul>
        </div>

        {/* contato */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold-deep)]">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--hc-ink-soft)]">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-[var(--hc-red-600)]" aria-hidden />
              <span>{HOSPITAL.endereco}, {HOSPITAL.cidade} · CEP {HOSPITAL.cep}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 flex-none text-[var(--hc-red-600)]" aria-hidden />
              <span>{HOSPITAL.telefones.join(" · ")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--hc-line)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:px-6 md:flex-row md:text-left">
          <p className="text-xs text-[var(--hc-ink-soft)]">
            © {ano} {HOSPITAL.nomeCurto} · {HOSPITAL.nome}
          </p>
          <p className="inline-flex items-center gap-2 text-xs text-[var(--hc-ink-soft)]">
            <ShieldCheck className="h-4 w-4 text-[var(--hc-gold-deep)]" aria-hidden />
            Dados tratados conforme a LGPD
          </p>
        </div>
        <p className="pb-6 text-center text-[11px] text-[var(--hc-ink-soft)]/80">
          Versão de demonstração do projeto — dados fictícios, sem informações reais de pacientes.
        </p>
      </div>
    </footer>
  );
}
