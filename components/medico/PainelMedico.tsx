"use client";

import { useState } from "react";
import { PainelCirurgias } from "./PainelCirurgias";
import { CadastrarInternacao } from "./CadastrarInternacao";

type Aba = "cirurgia" | "internacao";

export function PainelMedico() {
  const [aba, setAba] = useState<Aba>("cirurgia");

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
        {aba === "cirurgia" ? <PainelCirurgias /> : <CadastrarInternacao />}
      </div>
    </div>
  );
}
