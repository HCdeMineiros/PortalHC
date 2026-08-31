import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

/**
 * Troca obrigatória da senha no 1º acesso (senha provisória).
 * O usuário já está autenticado com a senha provisória; aqui define a nova
 * senha e remove a marca app_metadata.trocar_senha.
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

  const b = await req.json().catch(() => null);
  const novaSenha = String(b?.novaSenha ?? "");
  if (novaSenha.length < 6) {
    return NextResponse.json({ erro: "A nova senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }

  let admin;
  try {
    admin = criarClienteAdmin();
  } catch {
    return NextResponse.json({ erro: "service_role não configurada no servidor." }, { status: 500 });
  }

  const metaAtual = (auth.user.app_metadata ?? {}) as Record<string, unknown>;
  const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
    password: novaSenha,
    app_metadata: { ...metaAtual, trocar_senha: false },
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
