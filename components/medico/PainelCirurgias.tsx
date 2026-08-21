"use client";

import { useRef, useState } from "react";
import { CadastrarCirurgia, type PreCirurgia } from "./CadastrarCirurgia";
import { CatalogoProcedimentos } from "./CatalogoProcedimentos";
import type { Procedimento } from "@/lib/data/procedimentos";

/**
 * Une o cadastro de nova cirurgia com o banco de procedimentos.
 * O médico pode cadastrar do zero OU escolher uma cirurgia já ativa,
 * que preenche o formulário acima e rola até ele para gerar o acesso.
 */
export function PainelCirurgias({ onCadastrar }: { onCadastrar?: () => void }) {
  const [pre, setPre] = useState<PreCirurgia | null>(null);
  const topoRef = useRef<HTMLDivElement>(null);

  function usarCirurgia(p: Procedimento) {
    const reais = (centavos: number) => (centavos / 100).toString();
    setPre({
      nome: p.nome,
      cirurgiaoStr: reais(p.componentesCentavos.cirurgiao),
      token: Date.now(),
    });
    topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section ref={topoRef} className="scroll-mt-6">
        <CadastrarCirurgia pre={pre} onCadastrar={onCadastrar} />
      </section>
      <section className="mt-8">
        <CatalogoProcedimentos onUsar={usarCirurgia} />
      </section>
    </>
  );
}
