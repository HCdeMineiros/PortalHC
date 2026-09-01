// Gera lib/data/termos.ts a partir das pastas do HCM:
//  - Termos_de_Consentimento_HCM/NN_*.docx        (consentimento cirúrgico)
//  - Termos_Anestesia_HCM/ANEST_NN_*.docx          (consentimento de anestesia)
// Cada cirurgia tem seu par, ligado pelo número NN.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const mammoth = require("mammoth");

const DIR_CIR = "C:/Users/promedico/Desktop/Termos_de_Consentimento_HCM";
const DIR_ANE = "C:/Users/promedico/Desktop/Termos_Anestesia_HCM";

const semAcento = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slugArquivo = (arq) =>
  semAcento(arq.replace(/\.docx$/i, "").replace(/^(?:ANEST_)?\d+_/, ""))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Corpo = da seção "3." até a declaração/assinatura física. */
function extrairCorpo(texto) {
  const linhas = texto.split("\n").map((l) => l.replace(/\s+$/g, ""));
  let idxStart = linhas.findIndex((l) => /^\s*3\.\s/.test(l));
  if (idxStart < 0) idxStart = linhas.findIndex((l) => /O QUE É/i.test(l));
  let idxEnd = linhas.findIndex((l) => /Mineiros\/GO,\s*_+\s*de/i.test(l));
  if (idxEnd < 0) idxEnd = linhas.findIndex((l) => /^\s*DECLARAÇÃO DO M[ÉE]DICO/i.test(l));
  if (idxEnd < 0) idxEnd = linhas.findIndex((l) => /^\s*ASSINATURAS?\b/i.test(l));
  const corpoLinhas = idxStart >= 0 && idxEnd > idxStart ? linhas.slice(idxStart, idxEnd) : linhas.slice(Math.max(idxStart, 0));
  return corpoLinhas
    .filter((l) => !/^[\s_]+$/.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

async function lerPasta(dir, { grupo, prefixoChave, tituloPadrao, extrairProc }) {
  const arquivos = readdirSync(dir).filter((f) => /\.docx$/i.test(f) && !f.startsWith("~$"));
  const regs = [];
  for (const arq of arquivos) {
    const numero = Number((arq.match(/(\d+)_/) || [])[1]) || null;
    const { value } = await mammoth.extractRawText({ path: join(dir, arq) });
    const linhas = value.split("\n").map((l) => l.trim()).filter(Boolean);
    const procedimento = extrairProc(linhas) || slugArquivo(arq).replace(/_/g, " ");
    const corpo = extrairCorpo(value);
    regs.push({
      chave: `${prefixoChave}_${numero != null ? String(numero).padStart(2, "0") + "_" : ""}${slugArquivo(arq)}`,
      numero,
      titulo: tituloPadrao,
      procedimento,
      grupo,
      tipo: "termo_consentimento",
      exigeAssinatura: true,
      versao: "v1.0",
      arquivoFonte: arq,
      corpo,
    });
  }
  return regs;
}

const cirurgicos = await lerPasta(DIR_CIR, {
  grupo: "cirurgico",
  prefixoChave: "TCLE",
  tituloPadrao: "Termo de Consentimento Livre e Esclarecido",
  extrairProc: (linhas) => linhas[1] || "",
});
// remove o termo genérico de anestesia que fica na pasta de cirúrgicos (nº 45)
const cirurgicosFiltrados = cirurgicos.filter((r) => !/^45_?/.test((r.arquivoFonte || "")) || !/ANESTESIA/i.test(r.arquivoFonte));

const anestesia = await lerPasta(DIR_ANE, {
  grupo: "anestesia",
  prefixoChave: "ANEST",
  tituloPadrao: "Termo de Consentimento — Anestesia",
  extrairProc: (linhas) => (linhas.find((l) => /^Procedimento:/i.test(l)) || "").replace(/^Procedimento:\s*/i, ""),
});

const registros = [...cirurgicosFiltrados, ...anestesia].sort(
  (a, b) => a.grupo.localeCompare(b.grupo) || (a.numero || 999) - (b.numero || 999),
);

const ts = `// GERADO por scripts/gerar-termos-hcm.mjs — não editar à mão.
// Fontes: Desktop/Termos_de_Consentimento_HCM/ e Desktop/Termos_Anestesia_HCM/.

export type TipoTermo = "termo_consentimento" | "documento_informativo";

export interface TermoModelo {
  chave: string;
  numero: number | null;
  titulo: string;
  /** nome do procedimento / assunto do documento */
  procedimento: string;
  /** "cirurgico" (consentimento) | "anestesia" | ... */
  grupo: string;
  tipo: TipoTermo;
  exigeAssinatura: boolean;
  versao: string;
  arquivoFonte: string;
  /** corpo em parágrafos, pronto para exibição no portal */
  corpo: string[];
}

export const TERMOS: TermoModelo[] = ${JSON.stringify(registros, null, 2)};
`;

mkdirSync("lib/data", { recursive: true });
writeFileSync("lib/data/termos.ts", ts);

console.log(`OK — ${registros.length} termos → lib/data/termos.ts`);
console.log(`  Cirúrgicos: ${cirurgicosFiltrados.length} · Anestesia: ${anestesia.length}`);
const semCorpo = registros.filter((r) => r.corpo.length === 0);
if (semCorpo.length) {
  console.log(`⚠️ Sem corpo extraído (${semCorpo.length}):`);
  semCorpo.forEach((r) => console.log("   -", r.arquivoFonte));
}
