import { NextResponse } from "next/server";
import { validarAdmin } from "@/lib/supabase/validar";
import { ASSINAFY_ACCOUNT_ID, ASSINAFY_API_KEY, ASSINAFY_BASE_URL, ASSINAFY_CONFIGURADO, ASSINAFY_WEBHOOK_TOKEN } from "@/lib/assinafy/env";
import { consultarWebhook } from "@/lib/assinafy/client";

/** Diagnóstico da configuração da Assinafy (somente administrador). */
export async function GET(req: Request) {
  const v = await validarAdmin(req);
  if (v.erro) return v.erro;

  const relatorio: Record<string, unknown> = {
    configurado: ASSINAFY_CONFIGURADO,
    base_url: ASSINAFY_BASE_URL,
    api_key_presente: Boolean(ASSINAFY_API_KEY),
    api_key_final: ASSINAFY_API_KEY ? `…${ASSINAFY_API_KEY.slice(-4)}` : null,
    account_id_presente: Boolean(ASSINAFY_ACCOUNT_ID),
    webhook_token_presente: Boolean(ASSINAFY_WEBHOOK_TOKEN),
  };

  if (!ASSINAFY_CONFIGURADO) {
    relatorio.teste = "pulado — defina ASSINAFY_API_KEY e ASSINAFY_ACCOUNT_ID na Vercel.";
    return NextResponse.json({ ok: false, ...relatorio });
  }

  try {
    const webhook = await consultarWebhook();
    relatorio.teste = "conexão OK — chave e conta válidas.";
    relatorio.webhook_atual = webhook;
    return NextResponse.json({ ok: true, ...relatorio });
  } catch (e) {
    relatorio.teste = "falhou";
    relatorio.erro = e instanceof Error ? e.message : "erro desconhecido";
    return NextResponse.json({ ok: false, ...relatorio });
  }
}
