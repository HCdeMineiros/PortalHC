import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

/**
 * Redefine a senha de um usuário (médico/colaborador) — SOMENTE admin_dpo.
 * O admin informa a nova senha; a pessoa é obrigada a trocá-la no próximo acesso.
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
    .select("papel")
    .eq("id", auth.user.id)
    .single();
  if (perfil?.papel !== "admin_dpo") {
    return NextResponse.json({ erro: "Sem permissão (apenas administrador)." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  const novaSenha = String(body?.novaSenha ?? "");
  if (!id) return NextResponse.json({ erro: "Usuário não informado." }, { status: 400 });
  if (novaSenha.length < 6) {
    return NextResponse.json({ erro: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
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

  const metaAtual = (await admin.auth.admin.getUserById(id)).data.user?.app_metadata ?? {};
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: novaSenha,
    app_metadata: { ...metaAtual, trocar_senha: true }, // obriga a trocar no próximo acesso
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
