import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";

/** Molde escuro das páginas informativas do portal (Conheça o portal / cartões). */
export function ShellPortal({
  eyebrow,
  titulo,
  intro,
  children,
}: {
  eyebrow: string;
  titulo: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <FundoEscuro />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" aria-label="Portal HC — início"><Logo height={40} variant="light" /></Link>
        <Link href="/paciente/acesso" className="hcx-btn-cy px-5 py-2.5 text-sm">
          Acessar como paciente
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-hc-navy-soft transition-colors hover:text-hc-cyan"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar ao início
        </Link>

        <div className="mt-6">
          <span className="hcx-badge-d">{eyebrow}</span>
          <h1 className="font-display mt-4 max-w-[20ch] text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] text-hc-navy-ink">
            {titulo}
          </h1>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-hc-navy-soft">{intro}</p>}
        </div>

        <div className="mt-10">{children}</div>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-hc-navy-line pt-8">
          <Link href="/paciente/acesso" className="hcx-btn-cy">Acessar como paciente</Link>
          <Link href="/" className="hcx-btn-ghost-d">Voltar ao início</Link>
        </div>
      </main>

      <RodapeEscuro />
    </>
  );
}

/** Item de destaque (ícone + título + texto) reutilizável nas páginas. */
export function ItemPortal({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hcx-card-d p-6">
      <h3 className="font-display text-lg font-bold text-hc-navy-ink">{titulo}</h3>
      <p className="mt-2 text-[.95rem] leading-relaxed text-hc-navy-soft">{children}</p>
    </div>
  );
}
