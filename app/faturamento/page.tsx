import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
import { BotaoSair } from "@/components/medico/BotaoSair";
import { GuardaSetor } from "@/components/brand/GuardaSetor";
import { PainelFaturamento } from "@/components/colaborador/PainelFaturamento";

export default function AreaFaturamento() {
  return (
    <div className="hc-dark flex min-h-[100dvh] flex-1 flex-col">
      <FundoEscuro />
      <div className="hc-gold-rule" />
      <GuardaSetor papeis={["faturamento", "admin_dpo"]} nome="Faturamento">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link href="/"><Logo height={70} variant="light" /></Link>
          <BotaoSair />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <section className="hc-fade-up text-center">
            <span className="hc-badge">Setor Faturamento</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">Faturamento</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">
              Somente os atendimentos <strong>finalizados na internação</strong> (baixados). Filtre por data,
              confira as evidências e imprima o relatório.
            </p>
          </section>

          <div className="mt-8">
            <PainelFaturamento />
          </div>
        </main>
      </GuardaSetor>

      <RodapeEscuro />
    </div>
  );
}
