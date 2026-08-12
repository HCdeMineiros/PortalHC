// Remove o fundo sólido do logo por flood fill a partir das bordas.
// Só torna transparente a região de fundo conectada às bordas — não fura o interior.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "assets/brand/logo-hc.png";
const OUT = "public/brand/logo-hc.png";
const TOLERANCIA = 42; // distância de cor p/ considerar "fundo" (bordas suavizadas)

const img = sharp(SRC).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const idx = (x, y) => (y * W + x) * C;
// cor de fundo = média dos 4 cantos
const cantos = [[0,0],[W-1,0],[0,H-1],[W-1,H-1]];
let br=0,bg=0,bb=0;
for (const [x,y] of cantos){ const i=idx(x,y); br+=data[i]; bg+=data[i+1]; bb+=data[i+2]; }
br/=4; bg/=4; bb/=4;

const dist = (i) => Math.hypot(data[i]-br, data[i+1]-bg, data[i+2]-bb);

const visitado = new Uint8Array(W*H);
const fila = [];
for (let x=0;x<W;x++){ fila.push([x,0],[x,H-1]); }
for (let y=0;y<H;y++){ fila.push([0,y],[W-1,y]); }

let removidos = 0;
while (fila.length){
  const [x,y] = fila.pop();
  if (x<0||y<0||x>=W||y>=H) continue;
  const p = y*W+x;
  if (visitado[p]) continue;
  visitado[p] = 1;
  const i = idx(x,y);
  if (dist(i) > TOLERANCIA) continue; // chegou no objeto — para
  data[i+3] = 0; // transparente
  removidos++;
  fila.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
}

const out = await sharp(data, { raw: { width: W, height: H, channels: C } })
  .png({ compressionLevel: 9 })
  .toBuffer();
writeFileSync(OUT, out);
console.log(`OK — ${removidos} px de fundo removidos. Cor de fundo detectada: rgb(${br|0},${bg|0},${bb|0}) → ${OUT}`);
