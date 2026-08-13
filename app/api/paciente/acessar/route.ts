import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { TERMOS } from "@/lib/data/termos";
import { INFORMATIVOS } from "@/lib/data/informativos";

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\W+/)
    .filter((w) => w.length > 3);
}

/** Acha o TCLE cirúrgico mais parecido com o nome do procedimento. */
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

interface Doc {
  chave: string;
  tipo: "termo_consentimento" | "documento_informativo";
  titulo: string;
  subtitulo: string;
  corpo: string[];
  exigeAssinatura: boolean;
}

function selecionarDocumentos(sol: { tipo: string | null; procedimento_nome: string | null }): Doc[] {
  const docs: Doc[] = [];
  const add = (chave: string, tipo: Doc["tipo"], titulo: string, subtitulo: string, corpo: string[]) =>
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

export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  }

  const b = await req.json().catch(() => null);
  const cpf = soDigitos(b?.cpf);
  const ficha = String(b?.ficha ?? "").trim();
  const codigo = String(b?.codigo ?? "").trim();
  if (cpf.length !== 11 || !ficha || !codigo) {
    return NextResponse.json({ erro: "Preencha CPF, ficha e código." }, { status: 400 });
  }

  const admin = criarClienteAdmin();
  const generico = NextResponse.json({ erro: "Dados não conferem. Verifique CPF, ficha e código." }, { status: 401 });

  const { data: pac } = await admin
    .from("pacientes")
    .select("id, nome, ref_externa_promedico")
    .eq("cpf", cpf)
    .maybeSingle();
  if (!pac || (pac.ref_externa_promedico ?? "").trim() !== ficha) return generico;

  const { data: sol } = await admin
    .from("solicitacoes")
    .select(
      "id, numero, tipo, status, procedimento_nome, valor_total_centavos, acomodacao, acomodacao_dias, acomodacao_total_centavos, medicos(nome)",
    )
    .eq("paciente_id", pac.id)
    .eq("codigo_acesso_hash", hash(codigo))
    .maybeSingle();
  if (!sol) return generico;

  const { data: aceitesRows } = await admin
    .from("aceites_paciente")
    .select("documento_chave")
    .eq("solicitacao_id", sol.id);
  const aceites = (aceitesRows ?? []).map((a) => a.documento_chave);

  const totalGeral = (sol.valor_total_centavos ?? 0) + (sol.acomodacao_total_centavos ?? 0);

  return NextResponse.json({
    ok: true,
    paciente: { nome: pac.nome },
    solicitacao: { ...sol, total_geral_centavos: totalGeral },
    documentos: selecionarDocumentos(sol),
    aceites,
  });
}
