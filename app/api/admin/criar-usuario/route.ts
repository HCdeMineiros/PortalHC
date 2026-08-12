import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const PAPEIS_VALIDOS = ["medico", "internacao", "faturamento", "admin_dpo"];

/**
 * Cria um usuário (médico/colaborador) — SOMENTE admin_dpo.
 * Como a sessão é só em memória, o chamador envia seu access token no header
 * Authorization. Validamos o papel e então usamos a service role (servidor)
 * para criar o login e vinculá-lo ao papel.
 */
export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  }

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  // valida o chamador com o próprio token (RLS aplicada)
  const comoUsuario = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth, error: authErr } = await comoUsuario.auth.getUser(token);
  if (authErr || !auth.user) {
    return NextResponse.json({ erro: "Sessão inválida." }, { status: 401 });
  }
  const { data: perfil } = await comoUsuario
    .from("usuarios")
    .select("papel")
    .eq("id", auth.user.id)
    .single();
  if (perfil?.papel !== "admin_dpo") {
    return NextResponse.json({ erro: "Sem permissão (apenas administrador)." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const papel = String(body?.papel ?? "");
  const senha = String(body?.senha ?? "");
  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha nome, e-mail e senha." }, { status: 400 });
  }
  if (!PAPEIS_VALIDOS.includes(papel)) {
    return NextResponse.json({ erro: "Papel inválido." }, { status: 400 });
  }
  if (senha.length < 8) {
    return NextResponse.json({ erro: "A senha deve ter ao menos 8 caracteres." }, { status: 400 });
  }

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json(
      { erro: "service_role não configurada no servidor (defina SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 },
    );
  }

  // cria o login já confirmado
  const { data: novo, error: criarErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (criarErr || !novo.user) {
    return NextResponse.json(
      { erro: criarErr?.message || "Falha ao criar usuário." },
      { status: 400 },
    );
  }

  // vincula ao papel
  const { error: upErr } = await admin
    .from("usuarios")
    .upsert({ id: novo.user.id, nome, email, papel, ativo: true });
  if (upErr) {
    return NextResponse.json({ erro: upErr.message }, { status: 400 });
  }

  // se for médico, cria também o registro em medicos
  if (papel === "medico") {
    await admin.from("medicos").insert({ usuario_id: novo.user.id, nome, ativo: true });
  }

  return NextResponse.json({ ok: true, id: novo.user.id });
}
