import { NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { validarEquipe } from "@/lib/supabase/validar";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";

/** Lista os documentos da solicitação com o status de aceite/assinatura do paciente. */
export async function GET(req: Request) {
  const v = await validarEquipe(req);
  if (v.erro) return v.erro;

  const id = new URL(req.url).searchParams.get("solicitacao") || "";
  if (!id) return NextResponse.json({ erro: "Solicitação não informada." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: sol } = await admin.from("solicitacoes").select("tipo, procedimento_nome").eq("id", id).single();
  if (!sol) return NextResponse.json({ erro: "Solicitação não encontrada." }, { status: 404 });

  const docs = selecionarDocumentos({ tipo: sol.tipo, procedimento_nome: sol.procedimento_nome });
  const { data: aceites } = await admin
    .from("aceites_paciente")
    .select("documento_chave, tipo, carimbo_tempo, ip, user_agent, nome_digitado, documento_hash")
    .eq("solicitacao_id", id);

  const porChave = new Map((aceites ?? []).map((a) => [a.documento_chave, a]));
  const documentos = docs.map((d) => ({
    chave: d.chave,
    titulo: d.titulo,
    subtitulo: d.subtitulo,
    exigeAssinatura: d.exigeAssinatura,
    aceite: porChave.get(d.chave) ?? null,
  }));

  return NextResponse.json({ ok: true, documentos });
}
