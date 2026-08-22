import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { BotaoSair } from "@/components/medico/BotaoSair";
import { GuardaColaborador } from "@/components/colaborador/GuardaColaborador";
import { PainelEquipe } from "@/components/colaborador/PainelEquipe";

export default function AreaColaborador() {
  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <GuardaColaborador>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link href="/"><Logo height={70} /></Link>
          <BotaoSair />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <section className="hc-fade-up text-center">
            <span className="hc-badge">Acesso da Equipe</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">
              Internação & Faturamento
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">
              Acompanhe todas as cirurgias cadastradas, lance a acomodação e finalize o
              atendimento após o procedimento.
            </p>
          </section>

          <section className="mt-8">
            <PainelEquipe />
          </section>
        </main>
      </GuardaColaborador>

      <Rodape />
    </>
  );
}
