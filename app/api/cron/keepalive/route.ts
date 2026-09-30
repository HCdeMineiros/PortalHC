import { NextResponse } from "next/server";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Despertador" do banco (keep-alive).
 * Roda 1x por dia (Vercel Cron) e faz uma consulta levíssima no Postgres,
 * apenas para registrar atividade e impedir que o projeto Supabase gratuito
 * hiberne por inatividade. Não lê nem expõe dado de paciente.
 *
 * Segurança: se CRON_SECRET estiver definido no ambiente, exige o header
 * "Authorization: Bearer <CRON_SECRET>" (o Vercel Cron envia isso automaticamente).
 * Sem CRON_SECRET, a rota continua funcionando (a consulta é inofensiva).
 */
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${segredo}`) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
  }

  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ ok: false, motivo: "Supabase não configurado." }, { status: 503 });
  }

  try {
    const admin = criarClienteAdmin();
    // Consulta mínima: só conta linhas (head), sem trazer nenhum dado.
    const { error } = await admin.from("usuarios").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, despertado_em: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, erro: e instanceof Error ? e.message : "Falha ao consultar o banco." },
      { status: 502 },
    );
  }
}
