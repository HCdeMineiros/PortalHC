// Gera versão CLARA da logo composta (texto em creme) para uso sobre fundo escuro.
// Recolore apenas a região do texto (à direita da divisória), preservando o "H" vermelho.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "public/brand/logo-portal-hc.png";
const OUT = "public/brand/logo-portal-hc-light.png";

const img = sharp(SRC).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// creme claro
const CR = 245, CG = 241, CB = 234;
// a divisória fica ~42% da largura; recolorimos texto a partir de 44%
const xInicioTexto = Math.floor(W * 0.44);

let recol = 0;
for (let y = 0; y < H; y++) {
  for (let x = xInicioTexto; x < W; x++) {
    const i = (y * W + x) * C;
    const a = data[i + 3];
    if (a < 12) continue; // transparente
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max - min;
    // pixel cinza (texto/divisória): baixa saturação
    if (sat < 45) {
      data[i] = CR; data[i + 1] = CG; data[i + 2] = CB;
      recol++;
    }
  }
}

const out = await sharp(data, { raw: { width: W, height: H, channels: C } }).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(OUT, out);
console.log(`OK — ${recol} px de texto recoloridos p/ creme → ${OUT}`);
