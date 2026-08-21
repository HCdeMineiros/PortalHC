"use client";

import { useState } from "react";
import { PainelCirurgias } from "./PainelCirurgias";
import { CadastrarInternacao } from "./CadastrarInternacao";
import { MinhasSolicitacoes } from "./MinhasSolicitacoes";

type Aba = "cirurgia" | "internacao";

export function PainelMedico() {
  const [aba, setAba] = useState<Aba>("cirurgia");
  const [versao, setVersao] = useState(0);
  const aoCadastrar = () => setVersao((v) => v + 1);

  const botao = (chave: Aba, rotulo: string) =>
    `rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
      aba === chave
        ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
        : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
    }`;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        <button className={botao("cirurgia", "Cirurgia")} onClick={() => setAba("cirurgia")}>
          Cirurgia
        </button>
        <button className={botao("internacao", "Internação")} onClick={() => setAba("internacao")}>
          Internação clínica
        </button>
      </div>

      <div className="mt-6">
        {aba === "cirurgia" ? (
          <PainelCirurgias onCadastrar={aoCadastrar} />
        ) : (
          <CadastrarInternacao onCadastrar={aoCadastrar} />
        )}
      </div>

      {/* Lista de todos os cadastros do médico — permanecem até a exclusão pelo faturamento */}
      <div className="mt-8">
        <MinhasSolicitacoes versao={versao} />
      </div>
    </div>
  );
}
