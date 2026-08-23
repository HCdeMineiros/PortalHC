"use client";

import { useState } from "react";
import { CadastrarInternacao } from "@/components/medico/CadastrarInternacao";
import { CadastrarDiferenca } from "./CadastrarDiferenca";
import { Orcamento } from "./Orcamento";

type Aberto = null | "internacao" | "diferenca" | "orcamento";

/** Ações da equipe: internação clínica, diferença de acomodação e orçamento (prévia). */
export function SecaoCadastros() {
  const [aberto, setAberto] = useState<Aberto>(null);

  const botaoCadastro = (chave: "internacao" | "diferenca", rotulo: string) => (
    <button
      onClick={() => setAberto((v) => (v === chave ? null : chave))}
      className={`hc-btn ${aberto === chave ? "hc-btn-ghost" : "hc-btn-primary"} w-full sm:w-auto`}
    >
      {aberto === chave ? `Fechar ${rotulo}` : `+ Cadastrar ${rotulo}`}
    </button>
  );

  const ativoOrc = aberto === "orcamento";

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {botaoCadastro("internacao", "internação clínica")}
        {botaoCadastro("diferenca", "diferença de acomodação")}
        <button
          onClick={() => setAberto((v) => (v === "orcamento" ? null : "orcamento"))}
          className={`w-full whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:w-auto ${
            ativoOrc
              ? "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
              : "bg-gradient-to-b from-[var(--hc-gold)] to-[var(--hc-gold-deep)] text-[var(--hc-ink)] shadow-[0_10px_24px_-12px_rgba(154,123,18,.7)] hover:brightness-105"
          }`}
        >
          {ativoOrc ? "Fechar orçamento" : "💰 Orçamento"}
        </button>
      </div>

      {aberto === "internacao" && (
        <div className="mt-4">
          <CadastrarInternacao />
        </div>
      )}
      {aberto === "diferenca" && (
        <div className="mt-4">
          <CadastrarDiferenca />
        </div>
      )}
      {aberto === "orcamento" && (
        <div className="mt-4">
          <Orcamento />
        </div>
      )}
    </div>
  );
}
