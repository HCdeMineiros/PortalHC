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
          <PainelEquipe />
        </main>
      </GuardaColaborador>

      <Rodape />
    </>
  );
}
