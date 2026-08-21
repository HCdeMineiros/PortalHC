import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const ANESTESISTA_PCT = 0.5;
const AUXILIAR_PCT = 0.3;
const HOSPITAL_PCT = 0.6;

const soDigitos = (s: unknown) => String(s ?? "").replace(/\D/g, "");

/**
 * Edita uma solicitação (cirurgia ou internação) cadastrada pelo próprio médico —
 * para corrigir um cadastro errado. Recalcula a composição no servidor (autoritativo).
 * O código de acesso do paciente é preservado.
 */
export async function POST(req: Request) {
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
  if (!perfil || !["medico", "admin_dpo", "internacao", "faturamento"].includes(perfil.papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const id = String(b?.id ?? "");
  if (!id) return NextResponse.json({ erro: "ID não informado." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: sol } = await admin
    .from("solicitacoes")
    .select("id, tipo, status, criado_por, paciente_id, criado_em")
    .eq("id", id)
    .single();
  if (!sol) return NextResponse.json({ erro: "Solicitação não encontrada." }, { status: 404 });
  if (sol.status === "encerrada") {
    return NextResponse.json({ erro: "Atendimento finalizado não pode ser editado." }, { status: 400 });
  }

  // Regra de edição: admin edita sempre; nos primeiros 30 min o médico (criador)
  // edita cirurgia/internação e a equipe edita SOMENTE internação clínica.
  const ehAdmin = perfil.papel === "admin_dpo";
  const ehEquipe = ["internacao", "faturamento"].includes(perfil.papel);
  const ehCriador = sol.criado_por === auth.user.id;
  const ehInternacao = sol.tipo === "internacao_clinica";
  const dentro30 = Date.now() - new Date(sol.criado_em).getTime() <= 30 * 60 * 1000;
  const equipePode = ehEquipe && ehInternacao; // equipe só edita internação
  const permitido = ehAdmin || (dentro30 && (ehCriador || equipePode));
  if (!permitido) {
    let erro = "Você não pode editar este cadastro.";
    if (ehEquipe && !ehInternacao) erro = "A cirurgia só pode ser editada pelo médico.";
    else if (!dentro30) erro = "O prazo de 30 minutos para edição expirou. Somente o administrador pode editar.";
    return NextResponse.json({ erro }, { status: 403 });
  }

  // Dados do paciente (comuns aos dois tipos)
  const pacienteNome = String(b?.pacienteNome ?? "").trim();
  const cpf = soDigitos(b?.pacienteCpf);
  const nascimento = String(b?.pacienteNascimento ?? "").trim();
  const ficha = String(b?.pacienteFicha ?? "").trim();
  const whatsapp = String(b?.pacienteWhatsapp ?? "").trim();
  if (!pacienteNome) return NextResponse.json({ erro: "Informe o nome do paciente." }, { status: 400 });
  if (cpf.length !== 11) return NextResponse.json({ erro: "CPF do paciente inválido." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) return NextResponse.json({ erro: "Data de nascimento inválida." }, { status: 400 });
  if (!ficha) return NextResponse.json({ erro: "Informe o número da ficha." }, { status: 400 });

  // Campos específicos por tipo
  const upd: Record<string, unknown> = {};
  if (sol.tipo === "internacao_clinica") {
    const acom = String(b?.acomodacao ?? "");
    if (!["enfermaria", "apartamento", "suite"].includes(acom)) {
      return NextResponse.json({ erro: "Selecione a acomodação." }, { status: 400 });
    }
    upd.acomodacao = acom;
  } else {
    const nome = String(b?.nome ?? "").trim();
    const cirurgiao = Math.max(0, Math.round(Number(b?.cirurgiaoCentavos) || 0));
    const auxiliarPct = Number(b?.auxiliarPct) === 0.1 ? 0.1 : AUXILIAR_PCT;
    if (!nome) return NextResponse.json({ erro: "Informe o nome da cirurgia." }, { status: 400 });
    if (cirurgiao <= 0) return NextResponse.json({ erro: "Informe o valor do cirurgião." }, { status: 400 });
    const anestesista = Math.round(cirurgiao * ANESTESISTA_PCT);
    const auxiliar = Math.round(cirurgiao * auxiliarPct);
    const hospital = Math.round(cirurgiao * HOSPITAL_PCT);
    upd.procedimento_nome = nome;
    upd.componentes_centavos = { cirurgiao, anestesista, auxiliar, hospital };
    upd.valor_total_centavos = cirurgiao + anestesista + auxiliar + hospital;
  }

  const { error: e1 } = await admin.from("solicitacoes").update(upd).eq("id", id);
  if (e1) return NextResponse.json({ erro: e1.message }, { status: 400 });

  const { error: e2 } = await admin
    .from("pacientes")
    .update({ nome: pacienteNome, cpf, data_nascimento: nascimento, ref_externa_promedico: ficha, telefone_whatsapp: whatsapp })
    .eq("id", sol.paciente_id);
  if (e2) {
    const msg = /duplicate|unique/i.test(e2.message)
      ? "Já existe outro paciente com esse CPF."
      : e2.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
