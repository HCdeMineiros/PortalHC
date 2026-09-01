import { TERMOS } from "./termos";
import { INFORMATIVOS } from "./informativos";

export interface DocSolicitacao {
  chave: string;
  tipo: "termo_consentimento" | "documento_informativo";
  titulo: string;
  subtitulo: string;
  corpo: string[];
  exigeAssinatura: boolean;
}

const RUIDO = new Set(["cirurgia","cirurgica","cirurgico","correcao","procedimento","tratamento","para","com","sem","dos","das","por","tipo"]);

function tokens(s: string): Set<string> {
  return new Set(
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/\W+/)
      .filter((w) => w.length >= 3 && !RUIDO.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

/** slug do nome do arquivo (sem prefixos/número) — espelha o nome do catálogo. */
function slugArquivo(arquivo: string): string {
  return (arquivo || "").replace(/\.docx$/i, "").replace(/^ANEST_/i, "").replace(/^\d+_/, "").replace(/_/g, " ");
}

/** Termo cujo nome mais se parece com o informado, dentro do grupo. */
function melhorPorNome(nome: string, grupo: string) {
  const alvo = tokens(nome);
  if (!alvo.size) return null;
  let melhor: (typeof TERMOS)[number] | null = null;
  let score = 0;
  for (const t of TERMOS) {
    if (t.grupo !== grupo) continue;
    const s = Math.max(jaccard(alvo, tokens(slugArquivo(t.arquivoFonte))), jaccard(alvo, tokens(t.procedimento)));
    if (s > score) {
      score = s;
      melhor = t;
    }
  }
  return score > 0 ? melhor : null;
}

/**
 * Documentos que o paciente deve ler/assinar/dar OK, conforme a solicitação.
 * Cirurgia: termo cirúrgico específico + termo de anestesia específico (pareado
 * pelo número da cirurgia), ambos com assinatura; mais 2 informativos (ciência).
 */
export function selecionarDocumentos(sol: { tipo: string | null; procedimento_nome: string | null }): DocSolicitacao[] {
  // Diferença de acomodação é lançamento financeiro — sem documentos a assinar.
  if (sol.tipo === "diferenca_acomodacao") return [];

  const docs: DocSolicitacao[] = [];
  const add = (chave: string, tipo: DocSolicitacao["tipo"], titulo: string, subtitulo: string, corpo: string[]) =>
    docs.push({ chave, tipo, titulo, subtitulo, corpo, exigeAssinatura: tipo === "termo_consentimento" });

  if (sol.tipo !== "internacao_clinica") {
    // Cirurgia: consentimento cirúrgico + consentimento de anestesia específicos
    const cir = melhorPorNome(sol.procedimento_nome || "", "cirurgico");
    if (cir) add(cir.chave, "termo_consentimento", "Termo de Consentimento Livre e Esclarecido", cir.procedimento, cir.corpo);

    const anest =
      cir != null
        ? TERMOS.find((t) => t.grupo === "anestesia" && t.numero === cir.numero) ?? null
        : melhorPorNome(sol.procedimento_nome || "", "anestesia");
    if (anest) add(anest.chave, "termo_consentimento", "Termo de Consentimento — Anestesia", anest.procedimento, anest.corpo);
  }
  // Internação clínica: sem termo cirúrgico/anestesia — apenas os informativos abaixo.

  for (const chave of ["DOC_ORIENTACAO_VISITAS", "DOC_DIREITOS_PACIENTE"]) {
    const inf = INFORMATIVOS.find((i) => i.chave === chave);
    if (inf) add(inf.chave, "documento_informativo", inf.titulo, inf.procedimento, inf.corpo);
  }
  return docs;
}
