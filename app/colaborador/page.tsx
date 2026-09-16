import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
import { BotaoSair } from "@/components/medico/BotaoSair";
import { GuardaColaborador } from "@/components/colaborador/GuardaColaborador";
import { PainelEquipe } from "@/components/colaborador/PainelEquipe";

export default function AreaColaborador() {
  return (
    <div className="hc-dark flex min-h-[100dvh] flex-1 flex-col">
      <FundoEscuro />
      <div className="hc-gold-rule" />
      <GuardaColaborador>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link href="/"><Logo height={70} variant="light" /></Link>
          <BotaoSair />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <PainelEquipe />
        </main>
      </GuardaColaborador>

      <RodapeEscuro />
    </div>
  );
}
