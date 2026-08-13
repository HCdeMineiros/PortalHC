"use client";

import { useState } from "react";
import { CadastrarInternacao } from "@/components/medico/CadastrarInternacao";

/** Cadastro de internação clínica na Área da Equipe (ex.: atendente do PS). */
export function SecaoInternacao() {
  const [aberto, setAberto] = useState(false);
  return (
    <div>
      {!aberto ? (
        <button
          onClick={() => setAberto(true)}
          className="hc-btn hc-btn-primary w-full sm:w-auto"
        >
          + Cadastrar internação clínica
        </button>
      ) : (
        <div>
          <div className="mb-3 flex justify-end">
            <button onClick={() => setAberto(false)} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
              Fechar
            </button>
          </div>
          <CadastrarInternacao />
        </div>
      )}
    </div>
  );
}
