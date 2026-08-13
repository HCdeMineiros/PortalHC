import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const cent = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

/**
 * Cadastra uma INTERNAÇÃO CLÍNICA (sem cirurgia).
 * O médico define o honorário por diária de cada acomodação (enfermaria/apartamento/suíte).
 * O total é calculado pela equipe ao lançar a acomodação e as diárias.
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
  const { data: perfil } = await comoUsuario.from("usuarios").select("nome, papel").eq("id", auth.user.id).single();
  if (!perfil || !["medico", "admin_dpo"].includes(perfil.papel)) {
    return NextResponse.json({ erro: "Apenas médicos podem cadastrar internações." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const pacienteNome = String(b?.pacienteNome ?? "").trim();
  const cpf = soDigitos(b?.pacienteCpf);
  const ficha = String(b?.pacienteFicha ?? "").trim();
  const whatsapp = String(b?.pacienteWhatsapp ?? "").trim();
  const honorarios = {
    enfermaria: cent(b?.honorarioEnfermaria),
    apartamento: cent(b?.honorarioApartamento),
    suite: cent(b?.honorarioSuite),
  };

  if (!pacienteNome) return NextResponse.json({ erro: "Informe o nome do paciente." }, { status: 400 });
  if (cpf.length !== 11) return NextResponse.json({ erro: "CPF do paciente inválido." }, { status: 400 });
  if (!ficha) return NextResponse.json({ erro: "Informe o número da ficha do paciente." }, { status: 400 });
  if (honorarios.enfermaria + honorarios.apartamento + honorarios.suite <= 0) {
    return NextResponse.json({ erro: "Informe ao menos um honorário por acomodação." }, { status: 400 });
  }

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json({ erro: "service_role não configurada no servidor." }, { status: 500 });
  }

  // médico
  let medicoId: string;
  const { data: med } = await admin.from("medicos").select("id").eq("usuario_id", auth.user.id).maybeSingle();
  if (med?.id) medicoId = med.id;
  else {
    const { data: novoMed } = await admin
      .from("medicos")
      .insert({ usuario_id: auth.user.id, nome: perfil.nome, ativo: true })
      .select("id")
      .single();
    if (!novoMed) return NextResponse.json({ erro: "Falha ao vincular médico." }, { status: 400 });
    medicoId = novoMed.id;
  }

  // paciente por CPF
  let pacienteId: string;
  const { data: pac } = await admin.from("pacientes").select("id").eq("cpf", cpf).maybeSingle();
  if (pac?.id) {
    pacienteId = pac.id;
    await admin.from("pacientes").update({ nome: pacienteNome, ref_externa_promedico: ficha, telefone_whatsapp: whatsapp }).eq("id", pacienteId);
  } else {
    const { data: novoPac, error: pErr } = await admin
      .from("pacientes")
      .insert({ nome: pacienteNome, cpf, ref_externa_promedico: ficha, telefone_whatsapp: whatsapp, criado_por: auth.user.id })
      .select("id")
      .single();
    if (pErr || !novoPac) return NextResponse.json({ erro: pErr?.message || "Falha ao salvar paciente." }, { status: 400 });
    pacienteId = novoPac.id;
  }

  const codigo = String(randomInt(100000, 1000000));
  const ano = new Date().getFullYear();
  let numero = "";
  let solicitacao = null;
  for (let i = 0; i < 5 && !solicitacao; i++) {
    numero = `HC-${ano}-${randomInt(10000, 100000)}`;
    const { data, error } = await admin
      .from("solicitacoes")
      .insert({
        numero,
        tipo: "internacao_clinica",
        paciente_id: pacienteId,
        medico_id: medicoId,
        status: "aguardando_paciente",
        procedimento_nome: "Internação clínica",
        honorarios_acomodacao_centavos: honorarios,
        valor_total_centavos: 0,
        codigo_acesso_hash: hash(codigo),
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

  return NextResponse.json({ ok: true, numero, codigo });
}
