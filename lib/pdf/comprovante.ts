import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface DadosComprovante {
  hospital: string;
  dominio: string;
  ehAssinatura: boolean; // true = assinatura; false = ciência (OK)
  pacienteNome: string;
  pacienteCpf?: string | null;
  numeroSolicitacao: string;
  procedimento?: string | null;
  documentoTitulo: string;
  documentoSubtitulo?: string;
  corpo: string[];
  carimboTempo?: string | null; // ISO
  ip?: string | null;
  userAgent?: string | null;
  nomeDigitado?: string | null;
  documentoHash?: string | null;
}

const A4 = { w: 595.28, h: 841.89 };
const M = 50;
const L = A4.w - M * 2;
const VERM = rgb(0.78, 0.06, 0.14);
const OURO = rgb(0.6, 0.48, 0.07);
const TINTA = rgb(0.1, 0.09, 0.09);
const CINZA = rgb(0.29, 0.27, 0.27);

function limpar(s: string): string {
  return String(s ?? "")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")
    .replace(/…/g, "...").replace(/•/g, "-").replace(/ /g, " ")
    .replace(/[^\x20-\xFF]/g, "");
}
function quebrar(t: string, f: PDFFont, s: number, max: number): string[] {
  const ps = limpar(t).split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const p of ps) {
    const tt = cur ? `${cur} ${p}` : p;
    if (f.widthOfTextAtSize(tt, s) > max && cur) { out.push(cur); cur = p; } else cur = tt;
  }
  if (cur) out.push(cur);
  return out;
}
const dataBr = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR") : "-");

export async function gerarComprovantePdf(d: DadosComprovante): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const neg = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ita = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page: PDFPage = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - M;
  const nova = () => { page = pdf.addPage([A4.w, A4.h]); y = A4.h - M; };
  const garantir = (h: number) => { if (y - h < M + 34) nova(); };
  const linha = (t: string, f: PDFFont, s: number, cor = TINTA, gap = 4) => {
    for (const ln of quebrar(t, f, s, L)) {
      garantir(s + gap);
      page.drawText(ln, { x: M, y: y - s, size: s, font: f, color: cor });
      y -= s + gap;
    }
  };

  // Cabeçalho
  page.drawText(limpar(d.hospital), { x: M, y: y - 14, size: 14, font: neg, color: TINTA });
  y -= 22;
  page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 1.5, color: OURO });
  y -= 22;
  linha(d.ehAssinatura ? "Comprovante de Assinatura Eletronica" : "Comprovante de Ciencia (Leitura e Aceite)", neg, 15, VERM, 6);

  // Dados
  garantir(120);
  const box = [
    `Paciente: ${d.pacienteNome}${d.pacienteCpf ? `   |   CPF: ${d.pacienteCpf}` : ""}`,
    `Solicitacao: ${d.numeroSolicitacao}${d.procedimento ? `   |   Procedimento: ${d.procedimento}` : ""}`,
    `Documento: ${d.documentoTitulo}${d.documentoSubtitulo ? ` - ${d.documentoSubtitulo}` : ""}`,
    `Registrado em: ${dataBr(d.carimboTempo)}`,
    `Autenticacao do paciente: CPF + data de nascimento + codigo de acesso individual`,
    `IP de origem: ${d.ip || "-"}`,
    `Dispositivo/navegador: ${(d.userAgent || "-").slice(0, 110)}`,
    d.nomeDigitado ? `Nome confirmado: ${d.nomeDigitado}` : "",
    `Impressao digital do documento (SHA-256): ${d.documentoHash || "nao registrado (aceite anterior a atualizacao)"}`,
  ].filter(Boolean);
  const bh = 12 + box.length * 13;
  const top = y;
  page.drawRectangle({ x: M, y: top - bh, width: L, height: bh, borderColor: OURO, borderWidth: 0.8, color: rgb(0.98, 0.97, 0.95) });
  let yb = top - 15;
  for (const ln of box) {
    for (const w of quebrar(ln, reg, 8.8, L - 20)) {
      page.drawText(w, { x: M + 10, y: yb, size: 8.8, font: reg, color: TINTA });
      yb -= 13;
    }
  }
  y = top - bh - 16;

  linha(
    d.ehAssinatura
      ? "O paciente identificado acima manifestou concordancia e assinou eletronicamente o documento abaixo, de forma livre e esclarecida, com validade juridica nos termos da Lei 14.063/2020."
      : "O paciente identificado acima declarou ter lido e estar ciente do documento abaixo. Registro de assinatura eletronica simples (Lei 14.063/2020), com a trilha de auditoria acima como evidencia.",
    reg, 9.5, CINZA, 4,
  );
  y -= 8;

  // Conteúdo do documento (exatamente o que foi apresentado)
  linha("CONTEUDO DO DOCUMENTO", neg, 10, OURO, 6);
  for (const p of d.corpo) {
    if (!p?.trim()) continue;
    const titulo = /^\d+\.\s/.test(p.trim()) && p.trim().length < 90;
    linha(p, titulo ? neg : reg, titulo ? 9.5 : 9, titulo ? OURO : TINTA, 4);
    y -= 3;
  }

  // Rodapé
  const pgs = pdf.getPages();
  pgs.forEach((p, i) => {
    p.drawText(limpar(`${d.hospital} - Comprovante gerado em ${new Date().toLocaleString("pt-BR")}`), { x: M, y: 28, size: 7.5, font: ita, color: CINZA });
    p.drawText(`Pagina ${i + 1} de ${pgs.length} - ${limpar(d.dominio)}`, { x: A4.w - M - 150, y: 28, size: 7.5, font: reg, color: CINZA });
  });

  return pdf.save();
}
