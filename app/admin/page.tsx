import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { BotaoSair } from "@/components/medico/BotaoSair";
import { GuardaAdmin } from "@/components/admin/GuardaAdmin";
import { PainelUsuarios } from "@/components/admin/PainelUsuarios";

export default function AreaAdmin() {
  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <GuardaAdmin>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link href="/"><Logo height={70} /></Link>
          <BotaoSair />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <section className="hc-fade-up text-center">
            <span className="hc-badge">Administração / DPO</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">
              Painel do Administrador
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">
              Cadastre os acessos da equipe (médicos e colaboradores) e defina os papéis.
            </p>
          </section>

          <nav className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/medico" className="hc-btn hc-btn-ghost">Área do Médico →</Link>
            <Link href="/colaborador" className="hc-btn hc-btn-ghost">Área do Colaborador →</Link>
          </nav>

          <div className="mt-8">
            <PainelUsuarios />
          </div>
        </main>
      </GuardaAdmin>

      <Rodape />
    </>
  );
}
