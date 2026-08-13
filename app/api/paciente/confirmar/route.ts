import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Registra o aceite (ciência) ou a assinatura do paciente para um documento.
 * Revalida CPF + ficha + código antes de gravar. Captura evidências (IP, agente, hora).
 * (A assinatura qualificada via Assinafy entra depois, mantendo este registro como base.)
 */
export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) {
    return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  }

  const b = await req.json().catch(() => null);
  const cpf = soDigitos(b?.cpf);
  const ficha = String(b?.ficha ?? "").trim();
  const codigo = String(b?.codigo ?? "").trim();
  const chave = String(b?.chave ?? "").trim();
  const tipo = b?.tipo === "assinatura" ? "assinatura" : "ok";
  const nome = String(b?.nome ?? "").trim() || null;
  const assinatura = typeof b?.assinaturaDataUrl === "string" ? b.assinaturaDataUrl.slice(0, 200000) : null;

  if (cpf.length !== 11 || !ficha || !codigo || !chave) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const admin = criarClienteAdmin();
  const generico = NextResponse.json({ erro: "Sessão inválida. Acesse novamente." }, { status: 401 });

  const { data: pac } = await admin
    .from("pacientes")
    .select("id, ref_externa_promedico")
    .eq("cpf", cpf)
    .maybeSingle();
  if (!pac || (pac.ref_externa_promedico ?? "").trim() !== ficha) return generico;

  const { data: sol } = await admin
    .from("solicitacoes")
    .select("id")
    .eq("paciente_id", pac.id)
    .eq("codigo_acesso_hash", hash(codigo))
    .maybeSingle();
  if (!sol) return generico;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent");

  const { error } = await admin.from("aceites_paciente").upsert(
    {
      solicitacao_id: sol.id,
      documento_chave: chave,
      tipo,
      nome_digitado: nome,
      assinatura_dataurl: assinatura,
      carimbo_tempo: new Date().toISOString(),
      ip,
      user_agent: userAgent,
    },
    { onConflict: "solicitacao_id,documento_chave" },
  );
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
