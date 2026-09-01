import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "./env";

const PAPEIS_EQUIPE = ["internacao", "faturamento", "admin_dpo"];

/** Valida o chamador como membro da equipe (Bearer token). Retorna { user, papel } ou { erro }. */
export async function validarEquipe(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return { erro: NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 }) };
  }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }) };

  const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await c.auth.getUser(token);
  if (!auth.user) return { erro: NextResponse.json({ erro: "Sessão inválida." }, { status: 401 }) };
  const { data: perfil } = await c.from("usuarios").select("papel").eq("id", auth.user.id).single();
  if (!perfil || !PAPEIS_EQUIPE.includes(perfil.papel)) {
    return { erro: NextResponse.json({ erro: "Sem permissão (equipe)." }, { status: 403 }) };
  }
  return { user: auth.user, papel: perfil.papel as string };
}

/** Valida o chamador como administrador (admin_dpo). */
export async function validarAdmin(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return { erro: NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 }) };
  }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }) };
  const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await c.auth.getUser(token);
  if (!auth.user) return { erro: NextResponse.json({ erro: "Sessão inválida." }, { status: 401 }) };
  const { data: perfil } = await c.from("usuarios").select("papel").eq("id", auth.user.id).single();
  if (perfil?.papel !== "admin_dpo") {
    return { erro: NextResponse.json({ erro: "Sem permissão (apenas administrador)." }, { status: 403 }) };
  }
  return { user: auth.user };
}
