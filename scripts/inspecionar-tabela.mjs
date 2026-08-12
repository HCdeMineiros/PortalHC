// Inspeciona a planilha de cirurgias/diárias para entendermos a estrutura.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const SRC = "C:/Users/promedico/Desktop/Documentos PortalHC/TABELA - CIRURGIAS, DIÁRIAS.xlsx";
const wb = XLSX.read(readFileSync(SRC), { type: "buffer" });

console.log("=== ABAS ===", wb.SheetNames.join(" | "));
for (const nome of wb.SheetNames) {
  const ws = wb.Sheets[nome];
  const ref = ws["!ref"] || "vazia";
  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
  console.log(`\n--- Aba: "${nome}" (${ref}) — ${linhas.length} linhas ---`);
  linhas.slice(0, 14).forEach((row, i) => {
    const cells = row.map((c) => String(c).slice(0, 24)).join(" | ");
    console.log(`${String(i + 1).padStart(2)}: ${cells}`);
  });
}
