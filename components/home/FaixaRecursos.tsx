import { Scale, ShieldCheck, FlaskConical } from "lucide-react";

/** Faixa fina com atalhos úteis: Estatuto do Paciente, Resultados de Exames e LGPD. */
export function FaixaRecursos() {
  return (
    <section className="border-y border-hc-navy-line bg-hc-navy-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        {/* Esquerda: link para o Estatuto dos Direitos do Paciente */}
        <a
          href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15378.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[.9rem] font-semibold text-hc-navy-soft transition-colors hover:text-hc-cyan"
        >
          <Scale className="h-[22px] w-[22px] flex-none text-hc-cyan" strokeWidth={1.6} aria-hidden />
          Estatuto dos Direitos do Paciente
        </a>

        {/* Centro: botão para o portal de resultados de exames */}
        <a
          href="https://portal.pmedico.com/hcn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-hc-cyan px-6 py-2.5 text-[.9rem] font-bold text-hc-navy transition-all hover:-translate-y-0.5 hover:bg-hc-cyan/90"
        >
          <FlaskConical className="h-[20px] w-[20px] flex-none" strokeWidth={1.8} aria-hidden />
          Resultados de Exames
        </a>

        {/* Direita: link para a Lei Geral de Proteção de Dados */}
        <a
          href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[.9rem] font-semibold text-hc-navy-soft transition-colors hover:text-hc-cyan"
        >
          <ShieldCheck className="h-[22px] w-[22px] flex-none text-hc-cyan" strokeWidth={1.6} aria-hidden />
          Lei Geral de Proteção de Dados — LGPD
        </a>
      </div>
    </section>
  );
}
