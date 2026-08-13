import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

/**
 * Exclui um usuário (login) — SOMENTE admin_dpo.
 * Remove o usuário do Auth; a linha em `usuarios` cai por cascata (FK).
 * Histórico (médicos/solicitações) é preservado (usuario_id vira nulo).
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
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ erro: "ID não informado." }, { status: 400 });
  if (id === auth.user.id) {
    return NextResponse.json({ erro: "Você não pode excluir a própria conta." }, { status: 400 });
  }

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json(
      { erro: "service_role não configurada no servidor." },
      { status: 500 },
    );
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) {
    return NextResponse.json({ erro: delErr.message }, { status: 400 });
  }
  // garante remoção do perfil mesmo se não houver cascade
  await admin.from("usuarios").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
