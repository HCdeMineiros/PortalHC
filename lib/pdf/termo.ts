import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface DadosTermo {
  hospital: string;
  titulo: string; // ex.: "Termo de Consentimento Livre e Esclarecido"
  subtitulo: string; // procedimento / assunto
  corpo: string[]; // parágrafos (títulos de seção como "3. O QUE É..." viram negrito)
  pacienteNome: string;
  pacienteCpf?: string | null;
  numeroSolicitacao: string;
  medicoNome?: string | null;
  emitidoEm?: string; // data/hora legível
}

const A4 = { w: 595.28, h: 841.89 };
const MARGEM = 50;
const LARGURA = A4.w - MARGEM * 2;

const VERMELHO = rgb(0.78, 0.06, 0.14);
const OURO = rgb(0.6, 0.48, 0.07);
const TINTA = rgb(0.1, 0.09, 0.09);
const CINZA = rgb(0.29, 0.27, 0.27);

/** Remove caracteres fora do Latin-1 (WinAnsi) para o pdf-lib não falhar. */
function limpar(s: string): string {
  return String(s ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/•/g, "-")
    .replace(/ /g, " ")
    .replace(/[^\x20-\xFF]/g, "");
}

function quebrar(texto: string, font: PDFFont, size: number, maxLargura: number): string[] {
  const palavras = limpar(texto).split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const tentativa = atual ? `${atual} ${p}` : p;
    if (font.widthOfTextAtSize(tentativa, size) > maxLargura && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

const ehTitulo = (p: string) => /^\d+\.\s/.test(p.trim()) && p.trim().length < 90;

/** Gera o PDF do termo de consentimento (para envio à assinatura). */
export async function gerarTermoPdf(d: DadosTermo): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const negrito = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italico = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page: PDFPage = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - MARGEM;

  const novaPagina = () => {
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - MARGEM;
  };
  const garantir = (altura: number) => {
    if (y - altura < MARGEM + 40) novaPagina();
  };
  const escrever = (texto: string, font: PDFFont, size: number, cor = TINTA, gap = 4) => {
    const linhas = quebrar(texto, font, size, LARGURA);
    for (const ln of linhas) {
      garantir(size + gap);
      page.drawText(ln, { x: MARGEM, y: y - size, size, font, color: cor });
      y -= size + gap;
    }
  };

  // Cabeçalho
  page.drawText(limpar(d.hospital), { x: MARGEM, y: y - 14, size: 14, font: negrito, color: TINTA });
  y -= 22;
  page.drawLine({ start: { x: MARGEM, y }, end: { x: A4.w - MARGEM, y }, thickness: 1.5, color: OURO });
  y -= 22;

  escrever(d.titulo, negrito, 15, VERMELHO, 5);
  y -= 2;
  escrever(d.subtitulo, negrito, 11, CINZA, 8);

  // Bloco do paciente
  garantir(70);
  const boxTop = y;
  const linhasBox = [
    `Paciente: ${d.pacienteNome}${d.pacienteCpf ? `   |   CPF: ${d.pacienteCpf}` : ""}`,
    `Solicitacao: ${d.numeroSolicitacao}${d.medicoNome ? `   |   Medico: ${d.medicoNome}` : ""}`,
    d.emitidoEm ? `Emitido em: ${d.emitidoEm}` : "",
  ].filter(Boolean);
  const boxH = 12 + linhasBox.length * 14;
  page.drawRectangle({ x: MARGEM, y: boxTop - boxH, width: LARGURA, height: boxH, borderColor: OURO, borderWidth: 0.8, color: rgb(0.98, 0.97, 0.95) });
  let yb = boxTop - 16;
  for (const ln of linhasBox) {
    page.drawText(limpar(ln), { x: MARGEM + 10, y: yb, size: 9.5, font: regular, color: TINTA });
    yb -= 14;
  }
  y = boxTop - boxH - 18;

  // Corpo
  for (const paragrafo of d.corpo) {
    if (!paragrafo?.trim()) continue;
    if (ehTitulo(paragrafo)) {
      y -= 4;
      escrever(paragrafo, negrito, 10.5, OURO, 5);
    } else {
      escrever(paragrafo, regular, 10, TINTA, 5);
      y -= 4;
    }
  }

  // Área de assinatura (a assinatura eletrônica é aplicada pela Assinafy)
  garantir(90);
  y -= 24;
  page.drawLine({ start: { x: MARGEM, y }, end: { x: A4.w - MARGEM, y }, thickness: 0.6, color: OURO });
  y -= 18;
  escrever(
    "Declaro que li e compreendi as informacoes acima e assino este termo de forma livre e esclarecida.",
    regular,
    9.5,
    CINZA,
    4,
  );
  y -= 26;
  page.drawLine({ start: { x: MARGEM, y }, end: { x: MARGEM + 240, y }, thickness: 0.8, color: TINTA });
  page.drawText(limpar(d.pacienteNome), { x: MARGEM, y: y - 12, size: 9, font: regular, color: TINTA });
  page.drawText("Paciente (assinatura eletronica)", { x: MARGEM, y: y - 24, size: 8, font: italico, color: CINZA });

  // Rodapé com numeração
  const paginas = pdf.getPages();
  paginas.forEach((p, i) => {
    p.drawText(limpar(`${d.hospital} - Documento para assinatura eletronica`), {
      x: MARGEM,
      y: 28,
      size: 7.5,
      font: regular,
      color: CINZA,
    });
    p.drawText(`Pagina ${i + 1} de ${paginas.length}`, {
      x: A4.w - MARGEM - 70,
      y: 28,
      size: 7.5,
      font: regular,
      color: CINZA,
    });
  });

  return pdf.save();
}
