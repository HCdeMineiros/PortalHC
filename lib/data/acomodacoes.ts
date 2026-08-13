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
