// Extrai o texto dos .docx dos Termos de Consentimento para arquivos .txt revisáveis
// e gera um manifesto JSON. Fonte: Desktop/TERMOS DE CONSENTIMENTO/.
import { readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const mammoth = require("mammoth");

const BASE = "C:/Users/promedico/Desktop/TERMOS DE CONSENTIMENTO";
const OUT = "docs/termos-extraidos";
mkdirSync(OUT, { recursive: true });

// classificação (conforme definido com o Dr. Denis)
const CIENCIA = new Set([
  "Termo_Codigo_Vestimenta_Resumido.docx",
  "Protocolo_Surto_Hospitalar_Enfermagem.docx",
]);

const grupos = [
  { pasta: "Termos_de_Consentimento_HCM", categoria: "cirurgico" },
  { pasta: "Termos de Consentimento Ultrassom", categoria: "ultrassom" },
  { pasta: "", categoria: "raiz" }, // arquivos soltos na raiz
];

const manifesto = [];
let total = 0;

for (const g of grupos) {
  const dir = g.pasta ? join(BASE, g.pasta) : BASE;
  if (!existsSync(dir)) continue;
  const arquivos = readdirSync(dir).filter((f) => extname(f).toLowerCase() === ".docx");
  for (const arq of arquivos) {
    const caminho = join(dir, arq);
    try {
      const { value } = await mammoth.extractRawText({ path: caminho });
      const texto = value.replace(/\n{3,}/g, "\n\n").trim();
      const nomeSaida = basename(arq, ".docx") + ".txt";
      writeFileSync(join(OUT, nomeSaida), texto);
      const exigeAssinatura = !CIENCIA.has(arq);
      manifesto.push({
        arquivo: arq,
        grupo: g.categoria,
        tipo: exigeAssinatura ? "termo_consentimento" : "documento_informativo",
        exigeAssinatura,
        palavras: texto.split(/\s+/).filter(Boolean).length,
        primeiraLinha: (texto.split("\n").find((l) => l.trim()) || "").slice(0, 80),
      });
      total++;
    } catch (e) {
      manifesto.push({ arquivo: arq, grupo: g.categoria, erro: String(e.message || e) });
    }
  }
}

writeFileSync(join(OUT, "_manifesto.json"), JSON.stringify(manifesto, null, 2));

console.log(`Extraídos ${total} termos .docx → ${OUT}/`);
const porGrupo = manifesto.reduce((a, m) => ((a[m.grupo] = (a[m.grupo] || 0) + 1), a), {});
console.log("Por grupo:", porGrupo);
const semTexto = manifesto.filter((m) => !m.erro && m.palavras < 30);
if (semTexto.length) {
  console.log(`\n⚠️ Poucas palavras (possível .docx escaneado/imagem): ${semTexto.length}`);
  semTexto.forEach((m) => console.log(`  - ${m.arquivo} (${m.palavras} palavras)`));
}
console.log("\nAmostra:");
manifesto.slice(0, 6).forEach((m) => console.log(`  [${m.palavras ?? "?"}p] ${m.arquivo} — ${m.primeiraLinha || m.erro}`));
