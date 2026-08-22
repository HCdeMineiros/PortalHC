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

function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\W+/)
    .filter((w) => w.length > 3);
}

/** TCLE cirúrgico mais parecido com o nome do procedimento. */
function melhorTcle(nome: string) {
  const alvo = new Set(tokens(nome));
  let melhor: (typeof TERMOS)[number] | null = null;
  let score = 0;
  for (const t of TERMOS) {
    if (!t.exigeAssinatura || !["cirurgico", "ultrassom"].includes(t.grupo)) continue;
    const s = tokens(t.procedimento).filter((w) => alvo.has(w)).length;
    if (s > score) {
      score = s;
      melhor = t;
    }
  }
  return score > 0 ? melhor : null;
}

/** Documentos que o paciente deve ler/assinar/dar OK, conforme o tipo da solicitação. */
export function selecionarDocumentos(sol: { tipo: string | null; procedimento_nome: string | null }): DocSolicitacao[] {
  // Diferença de acomodação é um lançamento financeiro — sem documentos a assinar.
  if (sol.tipo === "diferenca_acomodacao") return [];

  const docs: DocSolicitacao[] = [];
  const add = (chave: string, tipo: DocSolicitacao["tipo"], titulo: string, subtitulo: string, corpo: string[]) =>
    docs.push({ chave, tipo, titulo, subtitulo, corpo, exigeAssinatura: tipo === "termo_consentimento" });

  if (sol.tipo === "internacao_clinica") {
    const decl = TERMOS.find((t) => t.chave === "TCLE_DECLARACAO_INEQUIVOCO_CONHECIMENTO_CONCORDANCIA");
    if (decl) add(decl.chave, "termo_consentimento", "Termo de Consentimento — Internação", "Internação clínica", decl.corpo);
  } else {
    const tcle = melhorTcle(sol.procedimento_nome || "");
    if (tcle) add(tcle.chave, "termo_consentimento", "Termo de Consentimento Livre e Esclarecido", tcle.procedimento, tcle.corpo);
    const an = TERMOS.find((t) => t.chave === "TCLE_45_ANESTESIA");
    if (an) add(an.chave, "termo_consentimento", "Termo de Consentimento — Anestesia", "Ato anestésico", an.corpo);
  }

  for (const chave of ["DOC_ORIENTACAO_VISITAS", "DOC_DIREITOS_PACIENTE"]) {
    const inf = INFORMATIVOS.find((i) => i.chave === chave);
    if (inf) add(inf.chave, "documento_informativo", inf.titulo, inf.procedimento, inf.corpo);
  }
  return docs;
}
