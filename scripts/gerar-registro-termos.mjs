// Transforma os termos extraídos em modelos "prontos para o portal" e gera
// lib/data/termos.ts (registro tipado) + prévias em docs/termos-portal/.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const IN = "docs/termos-extraidos";
const PREV = "docs/termos-portal";
mkdirSync(PREV, { recursive: true });

const manifesto = JSON.parse(readFileSync(join(IN, "_manifesto.json"), "utf8"));

function limparAcento(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function chaveDe(arquivo) {
  return "TCLE_" + limparAcento(arquivo.replace(/\.docx$/i, ""))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Transformação de um termo cirúrgico padronizado.
function transformar(texto) {
  const linhas = texto.split("\n").map((l) => l.replace(/\s+$/g, ""));
  const idxHeader = linhas.findIndex((l) => /TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO/i.test(l));

  // procedimento = linhas não vazias entre o header e a seção "1. IDENTIFICAÇÃO"
  let procedimento = "";
  if (idxHeader >= 0) {
    for (let i = idxHeader + 1; i < linhas.length; i++) {
      if (/^\s*1\.\s*IDENTIFICA/i.test(linhas[i])) break;
      if (linhas[i].trim()) procedimento += (procedimento ? " " : "") + linhas[i].trim();
    }
  }

  // início do corpo = seção "3." (ou "O QUE É"); fim = linha de data de assinatura física
  let idxStart = linhas.findIndex((l) => /^\s*3\.\s/.test(l));
  if (idxStart < 0) idxStart = linhas.findIndex((l) => /O QUE É O PROCEDIMENTO/i.test(l));
  let idxEnd = linhas.findIndex((l) => /Mineiros\/GO,\s*_+\s*de/i.test(l));
  if (idxEnd < 0) idxEnd = linhas.findIndex((l) => /^\s*DECLARAÇÃO DO MÉDICO/i.test(l));

  const ok = idxStart >= 0 && idxEnd > idxStart;
  const corpoLinhas = ok ? linhas.slice(idxStart, idxEnd) : linhas.slice(Math.max(idxHeader + 1, 0));

  // remove linhas que são só sublinhados/campos de papel
  const corpo = corpoLinhas
    .filter((l) => !/^[\s_]+$/.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return { procedimento, corpo, ok };
}

const CIRURGICO = new Set(["cirurgico", "ultrassom"]);
const registros = [];
const excecoes = [];

for (const m of manifesto) {
  if (m.erro) { excecoes.push({ arquivo: m.arquivo, motivo: m.erro }); continue; }
  const texto = readFileSync(join(IN, m.arquivo.replace(/\.docx$/i, ".txt")), "utf8");
  const numero = (m.arquivo.match(/^(\d+)_/) || [])[1] || null;

  let procedimento = "", corpo = [], ok = true;
  if (CIRURGICO.has(m.grupo) && m.exigeAssinatura) {
    ({ procedimento, corpo, ok } = transformar(texto));
    if (!ok) excecoes.push({ arquivo: m.arquivo, motivo: "estrutura fora do padrão — revisar manualmente" });
  } else {
    // ciência (vestimenta, surto) — mantém texto integral em parágrafos
    corpo = texto.split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
    procedimento = corpo[0]?.slice(0, 80) || m.arquivo;
  }

  const reg = {
    chave: chaveDe(m.arquivo),
    numero: numero ? Number(numero) : null,
    titulo: m.exigeAssinatura ? "Termo de Consentimento Livre e Esclarecido" : "Documento informativo",
    procedimento,
    grupo: m.grupo,
    tipo: m.tipo,
    exigeAssinatura: m.exigeAssinatura,
    versao: "v1.0",
    arquivoFonte: m.arquivo,
    corpo,
  };
  registros.push(reg);

  // prévia em markdown para o Dr. Denis revisar
  const md = `# ${reg.procedimento}\n\n> Fonte: ${reg.arquivoFonte} · ${reg.tipo} · ${reg.exigeAssinatura ? "ASSINATURA" : "CIÊNCIA"} · ${reg.corpo.length} parágrafos\n\n${reg.corpo.join("\n\n")}\n`;
  writeFileSync(join(PREV, reg.chave + ".md"), md);
}

registros.sort((a, b) => (a.numero || 999) - (b.numero || 999) || a.chave.localeCompare(b.chave));

const ts = `// GERADO por scripts/gerar-registro-termos.mjs — não editar à mão.
// Fonte: Desktop/TERMOS DE CONSENTIMENTO/ (extraídos em docs/termos-extraidos/).

export type TipoTermo = "termo_consentimento" | "documento_informativo";

export interface TermoModelo {
  chave: string;
  numero: number | null;
  titulo: string;
  /** nome do procedimento / assunto do documento */
  procedimento: string;
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

console.log(`Registro: ${registros.length} termos → lib/data/termos.ts`);
console.log(`Prévias .md → ${PREV}/`);
console.log(`Assinatura: ${registros.filter((r) => r.exigeAssinatura).length} · Ciência: ${registros.filter((r) => !r.exigeAssinatura).length}`);
if (excecoes.length) {
  console.log(`\n⚠️ Exceções para revisar (${excecoes.length}):`);
  excecoes.forEach((e) => console.log(`  - ${e.arquivo}: ${e.motivo}`));
} else {
  console.log("\n✓ Nenhuma exceção — todos seguiram o padrão.");
}
