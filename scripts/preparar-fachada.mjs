// Otimiza a foto da fachada para uso web (hero + fundo suave interno).
import sharp from "sharp";

const SRC = "C:/Users/promedico/Desktop/WhatsApp Image 2026-08-11 at 09.19.06.jpeg";

// 1) Hero — nítida, larga, comprimida
await sharp(SRC)
  .resize({ width: 2000, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/brand/fachada-hc.jpg");

// 2) Fundo suave — dessaturada e levemente desfocada p/ marca d'água interna
await sharp(SRC)
  .resize({ width: 1600, withoutEnlargement: true })
  .modulate({ saturation: 0.55, brightness: 1.05 })
  .blur(2)
  .jpeg({ quality: 68, mozjpeg: true })
  .toFile("public/brand/fachada-hc-soft.jpg");

const meta = await sharp(SRC).metadata();
console.log(`Origem: ${meta.width}x${meta.height}. Geradas: fachada-hc.jpg (2000w) e fachada-hc-soft.jpg (1600w).`);
