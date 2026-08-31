import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { BotaoSair } from "@/components/medico/BotaoSair";
import { GuardaSetor } from "@/components/brand/GuardaSetor";

export default function AreaAdministrativa() {
  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <GuardaSetor papeis={["administrativo", "admin_dpo"]} nome="Administrativo">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link href="/"><Logo height={70} /></Link>
          <BotaoSair />
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          <section className="hc-fade-up text-center">
            <span className="hc-badge">Setor Administrativo</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">Área administrativa</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">
              Bem-vindo(a). Esta área está <strong>em construção</strong> — em breve os recursos administrativos
              estarão disponíveis aqui.
            </p>
          </section>

          <div className="hc-card hc-gold-frame mt-8 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--hc-cream-2)] text-3xl">🧭</div>
            <p className="mt-4 text-[var(--hc-ink-soft)]">Nos diga quais funções você quer aqui e nós montamos.</p>
          </div>
        </main>
      </GuardaSetor>

      <Rodape />
    </>
  );
}
