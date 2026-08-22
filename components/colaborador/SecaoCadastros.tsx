"use client";

import { useState } from "react";
import { CadastrarInternacao } from "@/components/medico/CadastrarInternacao";
import { CadastrarDiferenca } from "./CadastrarDiferenca";

type Aberto = null | "internacao" | "diferenca";

/** Ações de cadastro da equipe: internação clínica e diferença de acomodação. */
export function SecaoCadastros() {
  const [aberto, setAberto] = useState<Aberto>(null);

  const botao = (chave: Exclude<Aberto, null>, rotulo: string) => (
    <button
      onClick={() => setAberto((v) => (v === chave ? null : chave))}
      className={`hc-btn ${aberto === chave ? "hc-btn-ghost" : "hc-btn-primary"} w-full sm:w-auto`}
    >
      {aberto === chave ? `Fechar ${rotulo}` : `+ Cadastrar ${rotulo}`}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {botao("internacao", "internação clínica")}
        {botao("diferenca", "diferença de acomodação")}
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
    </div>
  );
}
