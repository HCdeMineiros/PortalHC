// Acomodações (internação PARTICULAR) — fonte: aba "DIÁRIAS" da planilha (Outubro/2024).
// Valores em centavos. Para tratamento cirúrgico há taxa fixa adicional (ver TAXA_FIXA_CIRURGICA).

export interface Acomodacao {
  chave: string;
  nome: string;
  diariaCentavos: number;    // diária
  honorarioCentavos: number; // honorário de acomodação
  totalDiaCentavos: number;  // diária + honorário (por dia)
}

export const TABELA_ACOMODACAO_VERSAO = "Outubro/2024";

/** Taxa fixa cobrada em tratamento cirúrgico (particular), além da diária. */
export const TAXA_FIXA_CIRURGICA_CENTAVOS = 36000; // R$ 360,00

export const ACOMODACOES: Acomodacao[] = [
  { chave: "enfermaria", nome: "Enfermaria", diariaCentavos: 18000, honorarioCentavos: 12000, totalDiaCentavos: 30000 },
  { chave: "apartamento", nome: "Apartamento simples", diariaCentavos: 22000, honorarioCentavos: 15000, totalDiaCentavos: 37000 },
  { chave: "suite", nome: "Suíte", diariaCentavos: 36000, honorarioCentavos: 15000, totalDiaCentavos: 51000 },
  { chave: "uti", nome: "UTI", diariaCentavos: 75000, honorarioCentavos: 40000, totalDiaCentavos: 115000 },
];

// ===========================================================================
// Aba "DIFERENÇA DE ACOMODAÇÃO" — valor pago pelo paciente de plano (enfermaria)
// que sobe de acomodação. Clínico: só valor da diária. Cirúrgico: taxa fixa + diária.
// Valores em centavos.
// ===========================================================================
export interface DifAcom {
  chave: string;
  nome: string;
  taxaFixaCentavos: number;
  diariaCentavos: number;
}

export type TratamentoDif = "clinico" | "cirurgico";

export const DIFERENCA_ACOMODACAO: Record<TratamentoDif, DifAcom[]> = {
  clinico: [
    { chave: "apartamento", nome: "Apartamento", taxaFixaCentavos: 0, diariaCentavos: 25000 },
    { chave: "suite", nome: "Suíte", taxaFixaCentavos: 0, diariaCentavos: 33000 },
  ],
  cirurgico: [
    { chave: "apartamento", nome: "Apartamento", taxaFixaCentavos: 36000, diariaCentavos: 18000 },
    { chave: "suite", nome: "Suíte", taxaFixaCentavos: 40000, diariaCentavos: 22000 },
  ],
};

/** Retorna a tarifa da diferença de acomodação para o tratamento/acomodação. */
export function difAcomInfo(tratamento: string, acomodacao: string): DifAcom | undefined {
  const t: TratamentoDif = tratamento === "clinico" ? "clinico" : "cirurgico";
  return DIFERENCA_ACOMODACAO[t].find((a) => a.chave === acomodacao);
}
