import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { CatalogoProcedimentos } from "@/components/medico/CatalogoProcedimentos";
import { CadastrarCirurgia } from "@/components/medico/CadastrarCirurgia";
import { BotaoSair } from "@/components/medico/BotaoSair";

export default function AreaMedico() {
  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/"><Logo height={70} /></Link>
        <BotaoSair />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <section className="hc-fade-up text-center">
          <span className="hc-badge">Área do Médico</span>
          <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">
            Bem-vindo, Doutor(a).
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">
            Cadastre a cirurgia do seu paciente em poucos passos. O Portal HC gera os termos,
            envia ao paciente pelo WhatsApp e cuida de toda a assinatura eletrônica — você
            acompanha tudo em um só lugar.
          </p>
        </section>

        {/* Passos do fluxo do médico */}
        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { n: "1", t: "Selecione o procedimento", d: "Escolha no banco de cirurgias com valores já cadastrados." },
            { n: "2", t: "Vincule o paciente", d: "Identifique o paciente particular e a data prevista." },
            { n: "3", t: "Envie e acompanhe", d: "O paciente recebe, lê e assina. Você confirma a internação." },
          ].map((s) => (
            <div key={s.n} className="hc-card hc-gold-frame p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hc-red-050)] font-serif text-lg font-bold text-[var(--hc-red-600)]">
                {s.n}
              </div>
              <h3 className="font-serif text-xl font-semibold text-[var(--hc-ink)]">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--hc-ink-soft)]">{s.d}</p>
            </div>
          ))}
        </section>

        {/* Cadastro de nova cirurgia (cirurgião + anestesista → auxiliar/hospital automáticos) */}
        <section className="mt-8">
          <CadastrarCirurgia />
        </section>

        {/* Banco de procedimentos (catálogo real da planilha) */}
        <section className="mt-8">
          <CatalogoProcedimentos />
        </section>
      </main>

      <Rodape />
    </>
  );
}
