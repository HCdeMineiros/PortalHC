import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";

/**
 * Lista as solicitações cadastradas pelo próprio médico (cirurgias e internações).
 * Elas permanecem aqui até que o faturamento faça a exclusão.
 */
export async function GET(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const comoUsuario = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await comoUsuario.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ erro: "Sessão inválida." }, { status: 401 });
  const { data: perfil } = await comoUsuario.from("usuarios").select("papel").eq("id", auth.user.id).single();
  if (!perfil || !["medico", "admin_dpo"].includes(perfil.papel)) {
    return NextResponse.json({ erro: "Apenas médicos." }, { status: 403 });
  }

  const admin = criarClienteAdmin();
  const { data, error } = await admin
    .from("solicitacoes")
    .select(
      "id, numero, tipo, status, procedimento_nome, componentes_centavos, valor_total_centavos, codigo_acesso, data_prevista, acomodacao, acomodacao_dias, acomodacao_total_centavos, finalizada_em, criado_em, pacientes(nome, cpf, data_nascimento, ref_externa_promedico, telefone_whatsapp)",
    )
    .eq("criado_por", auth.user.id)
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  const sols = data ?? [];
  const ids = sols.map((s) => s.id);
  const aceitesPorSol: Record<string, number> = {};
  if (ids.length) {
    const { data: ac } = await admin.from("aceites_paciente").select("solicitacao_id").in("solicitacao_id", ids);
    for (const a of ac ?? []) aceitesPorSol[a.solicitacao_id] = (aceitesPorSol[a.solicitacao_id] ?? 0) + 1;
  }
  const comStatus = sols.map((s) => ({
    ...s,
    docs_total: selecionarDocumentos(s).length,
    docs_ok: aceitesPorSol[s.id] ?? 0,
  }));

  return NextResponse.json({ ok: true, solicitacoes: comStatus });
}
