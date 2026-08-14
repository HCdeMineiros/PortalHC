// Gera o favicon quadrado a partir do símbolo "H" (recorta transparência e centraliza).
import sharp from "sharp";

const SRC = "public/brand/logo-hc.png"; // símbolo H (fundo transparente)

// 1) recorta as bordas transparentes (deixa o "H" justo)
const cortado = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
const meta = await sharp(cortado).metadata();
const lado = Math.max(meta.width ?? 0, meta.height ?? 0);
const pad = Math.round(lado * 0.06);
const canvas = lado + pad * 2;

// 2) canvas quadrado transparente com o "H" centralizado
const quadrado = await sharp({
  create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: cortado, gravity: "center" }])
  .png()
  .toBuffer();

// 3) exporta nos tamanhos usados
await sharp(quadrado).resize(256, 256).png().toFile("public/brand/favicon-hc.png");
await sharp(quadrado).resize(512, 512).png().toFile("app/icon.png");
await sharp(quadrado).resize(180, 180).png().toFile("app/apple-icon.png");

console.log(`OK — favicon gerado (canvas ${canvas}px). H recortado: ${meta.width}x${meta.height}.`);
