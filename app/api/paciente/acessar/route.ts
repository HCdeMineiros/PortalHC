import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";
import { ASSINAFY_CONFIGURADO } from "@/lib/assinafy/env";

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  }

  const b = await req.json().catch(() => null);
  const cpf = soDigitos(b?.cpf);
  const nascimento = String(b?.nascimento ?? "").trim();
  const codigo = String(b?.codigo ?? "").trim();
  if (cpf.length !== 11 || !nascimento || !codigo) {
    return NextResponse.json({ erro: "Preencha CPF, data de nascimento e código." }, { status: 400 });
  }

  const admin = criarClienteAdmin();
  const generico = NextResponse.json({ erro: "Dados não conferem. Verifique CPF, data de nascimento e código." }, { status: 401 });

  const { data: pac } = await admin
    .from("pacientes")
    .select("id, nome, data_nascimento")
    .eq("cpf", cpf)
    .maybeSingle();
  if (!pac || String(pac.data_nascimento ?? "") !== nascimento) return generico;

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
    assinafyAtivo: ASSINAFY_CONFIGURADO,
  });
}
