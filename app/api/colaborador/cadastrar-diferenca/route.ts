import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { numeroSolicitacao } from "@/lib/util/numero";

const PAPEIS = ["internacao", "faturamento", "admin_dpo", "medico"];
const soDigitos = (s: unknown) => String(s ?? "").replace(/\D/g, "");
const cent = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

/**
 * Cadastra a DIFERENÇA DE ACOMODAÇÃO — quando o paciente de plano (enfermaria)
 * sobe de acomodação pagando a diferença dos honorários e da taxa de sala.
 * Valores digitados pela equipe; guardados em componentes_centavos (com o plano).
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
  if (!perfil || !PAPEIS.includes(perfil.papel)) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const cirurgiaoNome = String(b?.cirurgiaoNome ?? "").trim();
  const pacienteNome = String(b?.pacienteNome ?? "").trim();
  const cpf = soDigitos(b?.pacienteCpf);
  const ficha = String(b?.pacienteFicha ?? "").trim();
  const plano = String(b?.planoSaude ?? "").trim();
  const medico = cent(b?.honorarioMedicoCentavos);
  const anestesista = cent(b?.anestesistaCentavos);
  const auxiliar = cent(b?.auxiliarCentavos);
  const hospital = cent(b?.taxaSalaCentavos);
  const total = medico + anestesista + auxiliar + hospital;

  if (!cirurgiaoNome) return NextResponse.json({ erro: "Informe o nome do médico cirurgião." }, { status: 400 });
  if (!pacienteNome) return NextResponse.json({ erro: "Informe o nome do paciente." }, { status: 400 });
  if (cpf.length !== 11) return NextResponse.json({ erro: "CPF do paciente inválido." }, { status: 400 });
  if (!ficha) return NextResponse.json({ erro: "Informe o número da ficha." }, { status: 400 });
  if (!plano) return NextResponse.json({ erro: "Informe o plano de saúde." }, { status: 400 });
  if (total <= 0) return NextResponse.json({ erro: "Informe ao menos um valor da diferença." }, { status: 400 });

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json({ erro: "service_role não configurada no servidor." }, { status: 500 });
  }

  // paciente por CPF (usa o existente ou cria)
  let pacienteId: string;
  const { data: pac } = await admin.from("pacientes").select("id").eq("cpf", cpf).maybeSingle();
  if (pac?.id) {
    pacienteId = pac.id;
    await admin.from("pacientes").update({ nome: pacienteNome, ref_externa_promedico: ficha }).eq("id", pacienteId);
  } else {
    const { data: novoPac, error: pErr } = await admin
      .from("pacientes")
      .insert({ nome: pacienteNome, cpf, ref_externa_promedico: ficha, criado_por: auth.user.id })
      .select("id")
      .single();
    if (pErr || !novoPac) return NextResponse.json({ erro: pErr?.message || "Falha ao salvar paciente." }, { status: 400 });
    pacienteId = novoPac.id;
  }

  const base = numeroSolicitacao(ficha);
  let numero = "";
  let solicitacao = null;
  for (let i = 0; i < 6 && !solicitacao; i++) {
    numero = i === 0 ? base : `${base}-${i + 1}`;
    const { data, error } = await admin
      .from("solicitacoes")
      .insert({
        numero,
        tipo: "diferenca_acomodacao",
        paciente_id: pacienteId,
        medico_id: null,
        status: "aguardando_paciente",
        procedimento_nome: "Diferença de acomodação",
        componentes_centavos: { medico, anestesista, auxiliar, hospital, plano, medicoNome: cirurgiaoNome },
        valor_total_centavos: total,
        criado_por: auth.user.id,
      })
      .select("id")
      .single();
    if (!error && data) solicitacao = data;
    else if (error && !/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
  }
  if (!solicitacao) return NextResponse.json({ erro: "Não foi possível gerar o número." }, { status: 500 });

  return NextResponse.json({ ok: true, numero, total_centavos: total });
}
