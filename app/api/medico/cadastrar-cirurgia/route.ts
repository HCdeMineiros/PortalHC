import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { numeroSolicitacao } from "@/lib/util/numero";
import { enviarCodigoWhatsapp } from "@/lib/notifications/whatsapp";

const ANESTESISTA_PCT = 0.5;
const AUXILIAR_PCT = 0.3;
const HOSPITAL_PCT = 0.6;

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Cadastra uma cirurgia (médico) e gera o código de acesso do paciente.
 * Valida o chamador pelo token; grava com a service role (evita fricção de RLS).
 * Auxiliar (30%) e hospital (60%) são recalculados no servidor (autoritativo).
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
  const { data: auth, error: authErr } = await comoUsuario.auth.getUser(token);
  if (authErr || !auth.user) return NextResponse.json({ erro: "Sessão inválida." }, { status: 401 });

  const { data: perfil } = await comoUsuario
    .from("usuarios")
    .select("nome, papel")
    .eq("id", auth.user.id)
    .single();
  if (!perfil || !["medico", "admin_dpo"].includes(perfil.papel)) {
    return NextResponse.json({ erro: "Apenas médicos podem cadastrar cirurgias." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const nome = String(b?.nome ?? "").trim();
  const cirurgiao = Math.max(0, Math.round(Number(b?.cirurgiaoCentavos) || 0));
  const auxiliarPct = Number(b?.auxiliarPct) === 0.1 ? 0.1 : AUXILIAR_PCT; // 10% instrumentador · 30% auxiliar médico
  const pacienteNome = String(b?.pacienteNome ?? "").trim();
  const cpf = soDigitos(b?.pacienteCpf);
  const ficha = String(b?.pacienteFicha ?? "").trim();
  const nascimento = String(b?.pacienteNascimento ?? "").trim();
  const whatsapp = String(b?.pacienteWhatsapp ?? "").trim();
  const dataPrevista = String(b?.dataPrevista ?? "").trim() || null;

  if (!nome) return NextResponse.json({ erro: "Informe o nome da cirurgia." }, { status: 400 });
  if (cirurgiao <= 0) return NextResponse.json({ erro: "Informe o valor do cirurgião." }, { status: 400 });
  if (!pacienteNome) return NextResponse.json({ erro: "Informe o nome do paciente." }, { status: 400 });
  if (cpf.length !== 11) return NextResponse.json({ erro: "CPF do paciente inválido." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) return NextResponse.json({ erro: "Data de nascimento do paciente inválida." }, { status: 400 });
  if (!ficha) return NextResponse.json({ erro: "Informe o número da ficha do paciente." }, { status: 400 });

  const anestesista = Math.round(cirurgiao * ANESTESISTA_PCT);
  const auxiliar = Math.round(cirurgiao * auxiliarPct);
  const hospital = Math.round(cirurgiao * HOSPITAL_PCT);
  const total = cirurgiao + anestesista + auxiliar + hospital;

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json({ erro: "service_role não configurada no servidor." }, { status: 500 });
  }

  // garante um registro de médico para o usuário
  let medicoId: string;
  const { data: med } = await admin.from("medicos").select("id").eq("usuario_id", auth.user.id).maybeSingle();
  if (med?.id) {
    medicoId = med.id;
  } else {
    const { data: novoMed, error: medErr } = await admin
      .from("medicos")
      .insert({ usuario_id: auth.user.id, nome: perfil.nome, ativo: true })
      .select("id")
      .single();
    if (medErr || !novoMed) {
      return NextResponse.json({ erro: "Falha ao vincular médico." }, { status: 400 });
    }
    medicoId = novoMed.id;
  }

  // paciente (por CPF): usa o existente ou cria
  let pacienteId: string;
  const { data: pac } = await admin.from("pacientes").select("id").eq("cpf", cpf).maybeSingle();
  if (pac?.id) {
    pacienteId = pac.id;
    await admin
      .from("pacientes")
      .update({ nome: pacienteNome, ref_externa_promedico: ficha, data_nascimento: nascimento, telefone_whatsapp: whatsapp })
      .eq("id", pacienteId);
  } else {
    const { data: novoPac, error: pacErr } = await admin
      .from("pacientes")
      .insert({
        nome: pacienteNome,
        cpf,
        ref_externa_promedico: ficha,
        data_nascimento: nascimento,
        telefone_whatsapp: whatsapp,
        criado_por: auth.user.id,
      })
      .select("id")
      .single();
    if (pacErr || !novoPac) {
      return NextResponse.json({ erro: pacErr?.message || "Falha ao salvar paciente." }, { status: 400 });
    }
    pacienteId = novoPac.id;
  }

  // código de acesso do paciente (6 dígitos) + solicitação
  const codigo = String(randomInt(100000, 1000000));
  const base = numeroSolicitacao(ficha);
  let numero = "";
  let solicitacao = null;
  for (let tentativa = 0; tentativa < 6 && !solicitacao; tentativa++) {
    numero = tentativa === 0 ? base : `${base}-${tentativa + 1}`;
    const { data, error } = await admin
      .from("solicitacoes")
      .insert({
        numero,
        paciente_id: pacienteId,
        medico_id: medicoId,
        data_prevista: dataPrevista,
        status: "aguardando_paciente",
        procedimento_nome: nome,
        componentes_centavos: { cirurgiao, anestesista, auxiliar, hospital },
        valor_total_centavos: total,
        codigo_acesso_hash: hash(codigo),
        codigo_acesso: codigo,
        criado_por: auth.user.id,
      })
      .select("id, numero")
      .single();
    if (!error && data) solicitacao = data;
    else if (error && !/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
  }
  if (!solicitacao) {
    return NextResponse.json({ erro: "Não foi possível gerar o número da solicitação." }, { status: 500 });
  }

  const zap = await enviarCodigoWhatsapp({
    whatsapp,
    pacienteNome,
    codigo,
    numero,
    procedimento: nome,
  });

  return NextResponse.json({
    ok: true,
    numero,
    codigo, // mostrado uma vez ao médico para repassar ao paciente
    total_centavos: total,
    whatsapp_enviado: zap.enviado,
  });
}
