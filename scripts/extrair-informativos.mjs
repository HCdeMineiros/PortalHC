// Extrai texto dos PDFs informativos / colono para revisão.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const BASE = "C:/Users/promedico/Desktop/Documentos PortalHC";
const OUT = "docs/informativos-extraidos";
mkdirSync(OUT, { recursive: true });

const arquivos = [
  { arq: "colono.pdf", nome: "colono", tipo: "termo_consentimento" },
  { arq: "Orientação sobre Visitas.pdf", nome: "orientacao_visitas", tipo: "documento_informativo" },
  { arq: "direitos.pdf", nome: "direitos_paciente", tipo: "documento_informativo" },
  { arq: "Cópia de PROJETO LGPD 2021.pdf", nome: "projeto_lgpd_2021", tipo: "interno", maxChars: 4000 },
];

for (const f of arquivos) {
  try {
    const parser = new PDFParse({ data: readFileSync(join(BASE, f.arq)) });
    const data = await parser.getText();
    await parser.destroy();
    let texto = (data.text || "").replace(/\n{3,}/g, "\n\n").trim();
    if (f.maxChars) texto = texto.slice(0, f.maxChars) + "\n\n[...truncado — probe de identificação...]";
    writeFileSync(join(OUT, f.nome + ".txt"), texto);
    const palavras = texto.split(/\s+/).filter(Boolean).length;
    const alerta = palavras < 40 ? "  ⚠️ POUCO TEXTO (provável PDF escaneado → precisaria de OCR)" : "";
    console.log(`✓ ${f.arq} — ${data.numpages} págs, ${palavras} palavras${alerta}`);
  } catch (e) {
    console.log(`✗ ${f.arq} — erro: ${String(e.message || e)}`);
  }
}
console.log(`\nSaída: ${OUT}/`);
