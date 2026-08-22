import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { ACOMODACOES, TAXA_FIXA_CIRURGICA_CENTAVOS } from "@/lib/data/acomodacoes";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";

const PAPEIS_EQUIPE = ["internacao", "faturamento", "admin_dpo"];

/** Valida o chamador e retorna { user } ou uma resposta de erro. */
async function validarEquipe(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return { erro: NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 }) };
  }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }) };

  const comoUsuario = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await comoUsuario.auth.getUser(token);
  if (!auth.user) return { erro: NextResponse.json({ erro: "Sessão inválida." }, { status: 401 }) };
  const { data: perfil } = await comoUsuario.from("usuarios").select("nome, papel").eq("id", auth.user.id).single();
  if (!perfil || !PAPEIS_EQUIPE.includes(perfil.papel)) {
    return { erro: NextResponse.json({ erro: "Sem permissão (equipe)." }, { status: 403 }) };
  }
  return { user: auth.user, papel: perfil.papel as string, nome: (perfil.nome as string) ?? "" };
}

/** Lista todas as cirurgias cadastradas (equipe vê todas). */
export async function GET(req: Request) {
  const v = await validarEquipe(req);
  if (v.erro) return v.erro;

  const admin = criarClienteAdmin();
  const { data, error } = await admin
    .from("solicitacoes")
    .select(
      "id, numero, tipo, status, procedimento_nome, valor_total_centavos, componentes_centavos, codigo_acesso, data_prevista, acomodacao, acomodacao_dias, acomodacao_total_centavos, finalizada_em, criado_em, pacientes(nome, cpf, data_nascimento, ref_externa_promedico, telefone_whatsapp), medicos(nome)",
    )
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  const cirurgias = data ?? [];
  // conta os documentos que o paciente já assinou/deu OK, por solicitação
  const ids = cirurgias.map((c) => c.id);
  const aceitesPorSol: Record<string, number> = {};
  if (ids.length) {
    const { data: ac } = await admin.from("aceites_paciente").select("solicitacao_id").in("solicitacao_id", ids);
    for (const a of ac ?? []) aceitesPorSol[a.solicitacao_id] = (aceitesPorSol[a.solicitacao_id] ?? 0) + 1;
  }
  const comStatus = cirurgias.map((c) => ({
    ...c,
    docs_total: selecionarDocumentos(c).length,
    docs_ok: aceitesPorSol[c.id] ?? 0,
  }));

  return NextResponse.json({ ok: true, cirurgias: comStatus, papel: v.papel });
}

/** Finaliza o atendimento OU lança a acomodação. */
export async function POST(req: Request) {
  const v = await validarEquipe(req);
  if (v.erro) return v.erro;

  const b = await req.json().catch(() => null);
  const id = String(b?.id ?? "");
  const acao = String(b?.acao ?? "");
  if (!id) return NextResponse.json({ erro: "ID não informado." }, { status: 400 });

  const admin = criarClienteAdmin();

  if (acao === "finalizar") {
    // guarda quem finalizou/baixou dentro de componentes_centavos (jsonb), sem nova coluna
    const { data: atual } = await admin.from("solicitacoes").select("componentes_centavos").eq("id", id).single();
    const comp = {
      ...(atual?.componentes_centavos ?? {}),
      finalizadaPorNome: v.nome || "",
      finalizadaPorId: v.user.id,
    };
    const { error } = await admin
      .from("solicitacoes")
      .update({ status: "encerrada", finalizada_em: new Date().toISOString(), componentes_centavos: comp })
      .eq("id", id);
    if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (acao === "acomodacao") {
    const chave = String(b?.acomodacao ?? "");
    const dias = Math.max(1, Math.round(Number(b?.dias) || 0));
    const acom = ACOMODACOES.find((a) => a.chave === chave);
    if (!acom) return NextResponse.json({ erro: "Acomodação inválida." }, { status: 400 });

    const { data: sol } = await admin.from("solicitacoes").select("tipo").eq("id", id).single();

    let total: number;
    if (sol?.tipo === "internacao_clinica") {
      // internação clínica: diária da acomodação (já inclui honorário) × dias
      total = acom.totalDiaCentavos * dias;
    } else {
      // cirurgia: taxa fixa + diária × dias
      total = TAXA_FIXA_CIRURGICA_CENTAVOS + acom.totalDiaCentavos * dias;
    }

    const { error } = await admin
      .from("solicitacoes")
      .update({ acomodacao: chave, acomodacao_dias: dias, acomodacao_total_centavos: total })
      .eq("id", id);
    if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, acomodacao_total_centavos: total });
  }

  return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
}
