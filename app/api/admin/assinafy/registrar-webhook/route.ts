import { NextResponse } from "next/server";
import { validarAdmin } from "@/lib/supabase/validar";
import { ASSINAFY_CONFIGURADO, ASSINAFY_WEBHOOK_TOKEN } from "@/lib/assinafy/env";
import { registrarWebhook } from "@/lib/assinafy/client";
import { HOSPITAL } from "@/lib/brand";

const EVENTOS = ["signer_signed_document", "document_certificated"];

/** Registra/atualiza o webhook da Assinafy apontando para o nosso endpoint (somente admin). */
export async function POST(req: Request) {
  const v = await validarAdmin(req);
  if (v.erro) return v.erro;

  if (!ASSINAFY_CONFIGURADO) {
    return NextResponse.json({ erro: "Assinafy não configurado (defina API key e account id na Vercel)." }, { status: 503 });
  }
  if (!ASSINAFY_WEBHOOK_TOKEN) {
    return NextResponse.json({ erro: "Defina ASSINAFY_WEBHOOK_TOKEN na Vercel antes de registrar o webhook." }, { status: 400 });
  }

  const b = await req.json().catch(() => ({}));
  // usa a origem informada, ou o site oficial do hospital
  const base = String((b as { site?: string })?.site || `https://${HOSPITAL.dominio}`).replace(/\/+$/, "");
  const url = `${base}/api/assinafy/webhook?token=${encodeURIComponent(ASSINAFY_WEBHOOK_TOKEN)}`;
  const email = String((b as { email?: string })?.email || v.user!.email || "").trim();
  if (!email) return NextResponse.json({ erro: "E-mail de contato do webhook não informado." }, { status: 400 });

  try {
    const data = await registrarWebhook(url, email, EVENTOS);
    return NextResponse.json({ ok: true, url, eventos: EVENTOS, retorno: data });
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Falha ao registrar webhook." }, { status: 502 });
  }
}
