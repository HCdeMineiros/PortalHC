// Gera lib/data/procedimentos.ts a partir da aba "CIRURGIAS - PARTICULAR".
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const SRC = "C:/Users/promedico/Desktop/Documentos PortalHC/TABELA - CIRURGIAS, DIÁRIAS.xlsx";
const wb = XLSX.read(readFileSync(SRC), { type: "buffer" });
const ws = wb.Sheets["CIRURGIAS - PARTICULAR"];
const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });

const cent = (v) => (v === "" || v == null ? 0 : Math.round(Number(v) * 100));

// dados começam após a linha de cabeçalho "PROCEDIMENTO | CIRURGIÃO | ..."
const idxHeader = linhas.findIndex((r) => String(r[0]).trim().toUpperCase() === "PROCEDIMENTO");
const dados = linhas.slice(idxHeader + 1).filter((r) => String(r[0]).trim() !== "");

const procedimentos = dados.map((r, i) => ({
  codigo: `P${String(i + 1).padStart(3, "0")}`,
  nome: String(r[0]).trim(),
  componentesCentavos: {
    cirurgiao: cent(r[1]),
    auxiliar1: cent(r[2]),
    auxiliar2: cent(r[3]),
    anestesista: cent(r[4]),
    pediatra: cent(r[5]),
    exRnVideo: cent(r[6]),
    taxaSala: cent(r[7]),
  },
  valorTotalCentavos: cent(r[8]),
}));

// validação: soma dos componentes == total?
const divergentes = procedimentos.filter((p) => {
  const soma = Object.values(p.componentesCentavos).reduce((a, b) => a + b, 0);
  return soma !== p.valorTotalCentavos;
});

const ts = `// GERADO automaticamente por scripts/gerar-catalogo.mjs — não editar à mão.
// Fonte: "TABELA - CIRURGIAS, DIÁRIAS.xlsx" · aba "CIRURGIAS - PARTICULAR".

export interface ComponentesValor {
  cirurgiao: number;
  auxiliar1: number;
  auxiliar2: number;
  anestesista: number;
  pediatra: number;
  exRnVideo: number;
  taxaSala: number;
}

export interface Procedimento {
  codigo: string;
  nome: string;
  /** valor total em centavos (particular) */
  valorTotalCentavos: number;
  componentesCentavos: ComponentesValor;
}

/** Versão vigente da tabela de preços (para o versionamento no banco). */
export const TABELA_VERSAO = "Outubro/2024";
export const TABELA_MOEDA = "BRL";

export const PROCEDIMENTOS: Procedimento[] = ${JSON.stringify(procedimentos, null, 2)};
`;

mkdirSync("lib/data", { recursive: true });
writeFileSync("lib/data/procedimentos.ts", ts);

console.log(`OK — ${procedimentos.length} procedimentos gravados em lib/data/procedimentos.ts`);
console.log(`Divergências (soma dos componentes ≠ total): ${divergentes.length}`);
divergentes.slice(0, 8).forEach((p) => {
  const soma = Object.values(p.componentesCentavos).reduce((a, b) => a + b, 0);
  console.log(`  - ${p.nome}: soma ${soma / 100} vs total ${p.valorTotalCentavos / 100}`);
});
console.log("\nAmostra:");
procedimentos.slice(0, 5).forEach((p) =>
  console.log(`  ${p.codigo} ${p.nome} — R$ ${(p.valorTotalCentavos / 100).toLocaleString("pt-BR")}`),
);
