import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";

export default function Colaborador() {
  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo size={74} /></Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10 text-center">
        <div className="hc-card hc-gold-frame p-8">
          <span className="hc-badge">Área da equipe</span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">
            Acesso de colaboradores
          </h1>
          <p className="mt-3 text-[var(--hc-ink-soft)]">
            Login com autenticação de dois fatores (MFA) para Administração/DPO, Médico e
            Internação. Esta área será construída na fatia 1 (Fundação & Segurança).
          </p>
          <Link href="/" className="hc-btn hc-btn-ghost mt-6 w-full">← Voltar ao início</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
