// Limpa os PDFs extraídos e gera lib/data/informativos.ts (colono + visitas + direitos).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const IN = "docs/informativos-extraidos";

// linhas de "lixo": cabeçalho de sistema, marcadores de página e QUALQUER
// linha que contenha dados do paciente-teste do print (PII de exemplo).
const LIXO = [
  /--\s*\d+\s*of\s*\d+\s*--/i,
  /Data Emissão/i,
  /HOSPITAL DAS CLÍNICAS DR\. NEVES/i,
  /GABRIELA/i,
  /Página \d+ de \d+/i,
  /Paciente:/i,
  /Ficha:/i,
  /\bCPF\b/i,
  /\bRG\b/i,
  /\bTESTE\b/i,
  /Norma Técnica Resolução/i,
  /^\d{1,2}$/, // números soltos de página (01, 02)
];

// valores exatos do print de teste — removidos por segurança em qualquer posição
const PII_TESTE = [/55876871125/g, /41\.?875\.?789-?6/g, /170245/g, /10\/08\/2026/g];

function limpar(nome, iniciarNaClausula1 = false) {
  const bruto = readFileSync(join(IN, nome + ".txt"), "utf8");
  let linhas = bruto
    .split("\n")
    .map((l) => {
      let s = l.replace(/\s+/g, " ").trim();
      for (const rx of PII_TESTE) s = s.replace(rx, "");
      return s.trim();
    })
    .filter((l) => l && !LIXO.some((rx) => rx.test(l)));

  if (iniciarNaClausula1) {
    const i = linhas.findIndex((l) => /^1\.\s/.test(l));
    if (i > 0) linhas = linhas.slice(i);
  }
  return linhas;
}

const docs = [
  {
    chave: "DOC_COLONOSCOPIA",
    titulo: "Termo de Ciência e Consentimento — Colonoscopia",
    procedimento: "Colonoscopia",
    tipo: "termo_consentimento",
    exigeAssinatura: true,
    versao: "v1.0",
    arquivoFonte: "colono.pdf",
    corpo: limpar("colono", true),
  },
  {
    chave: "DOC_ORIENTACAO_VISITAS",
    titulo: "Orientações sobre Visitas e Acompanhantes",
    procedimento: "Visitas e acompanhamento de pacientes internados",
    tipo: "documento_informativo",
    exigeAssinatura: false,
    versao: "v1.0",
    arquivoFonte: "Orientação sobre Visitas.pdf",
    corpo: limpar("orientacao_visitas"),
  },
  {
    chave: "DOC_DIREITOS_PACIENTE",
    titulo: "Direitos do Paciente",
    procedimento: "Direitos e deveres do paciente",
    tipo: "documento_informativo",
    exigeAssinatura: false,
    versao: "v1.0",
    arquivoFonte: "direitos.pdf",
    corpo: limpar("direitos_paciente"),
  },
];

const ts = `// GERADO por scripts/gerar-informativos.mjs — não editar à mão.
// Fonte: PDFs em Desktop/Documentos PortalHC/ (extraídos em docs/informativos-extraidos/).

export type TipoDocumento = "termo_consentimento" | "documento_informativo";

export interface DocumentoPdf {
  chave: string;
  titulo: string;
  procedimento: string;
  tipo: TipoDocumento;
  exigeAssinatura: boolean;
  versao: string;
  arquivoFonte: string;
  corpo: string[];
}

export const INFORMATIVOS: DocumentoPdf[] = ${JSON.stringify(docs, null, 2)};
`;

writeFileSync("lib/data/informativos.ts", ts);
console.log(`OK — ${docs.length} documentos → lib/data/informativos.ts`);
docs.forEach((d) => console.log(`  ${d.chave}: ${d.corpo.length} parágrafos (${d.exigeAssinatura ? "assinatura" : "ciência"})`));
