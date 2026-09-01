import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";
import { ASSINAFY_WEBHOOK_TOKEN } from "@/lib/assinafy/env";
import { statusDocumento, baixarArtefato } from "@/lib/assinafy/client";

const BUCKET = "documentos-assinados";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/** Extrai o id do documento Assinafy de vários formatos possíveis do payload. */
function extrairDocId(body: Record<string, unknown>): string | null {
  const p = (body?.payload ?? {}) as Record<string, unknown>;
  const o = (body?.object ?? {}) as Record<string, unknown>;
  const s = (body?.subject ?? {}) as Record<string, unknown>;
  const doc = (p?.document ?? {}) as Record<string, unknown>;
  return (
    (p.document_id as string) ||
    (doc.id as string) ||
    (p.id as string) ||
    (o.id as string) ||
    (s.id as string) ||
    null
  );
}

/**
 * Webhook da Assinafy. Segurança: token secreto na URL (?token=) + re-consulta
 * autenticada do status antes de agir (o webhook v1 não tem assinatura própria).
 */
export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) return NextResponse.json({ ok: true });
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!ASSINAFY_WEBHOOK_TOKEN || token !== ASSINAFY_WEBHOOK_TOKEN) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const evento = String(body?.event ?? "");
  const docId = extrairDocId(body);
  if (!docId) return NextResponse.json({ ok: true });

  const admin = criarClienteAdmin();
  const { data: row } = await admin
    .from("assinafy_docs")
    .select("id, solicitacao_id, documento_chave, status")
    .eq("assinafy_document_id", docId)
    .maybeSingle();
  if (!row) return NextResponse.json({ ok: true });

  let status = "";
  try {
    status = await statusDocumento(docId); // re-consulta autenticada
  } catch {
    return NextResponse.json({ ok: true });
  }

  const PRONTO_ASSINADO = new Set(["ready", "certificating", "certificated"]);
  const assinado = evento === "signer_signed_document" || PRONTO_ASSINADO.has(status);
  if (assinado && row.status !== "assinado") {
    await admin.from("assinafy_docs").update({ status: "assinado", assinado_em: new Date().toISOString() }).eq("id", row.id);
  }

  // quando assinado/pronto, baixa e guarda a cópia + registra o aceite
  if (PRONTO_ASSINADO.has(status)) {
    try {
      let bytes: Uint8Array | null = null;
      for (const art of ["certificated", "pades", "original"]) {
        try {
          const b = await baixarArtefato(docId, art);
          if (b && b.length) { bytes = b; break; }
        } catch {
          /* tenta o próximo artefato */
        }
      }
      if (!bytes) return NextResponse.json({ ok: true });

      const path = `${row.solicitacao_id}/${row.documento_chave}.pdf`;
      await admin.storage.from(BUCKET).upload(path, bytes, { contentType: "application/pdf", upsert: true });

      await admin
        .from("assinafy_docs")
        .update({ status: "assinado", arquivo_path: path, assinado_em: new Date().toISOString() })
        .eq("id", row.id);

      const { data: sol } = await admin
        .from("solicitacoes")
        .select("tipo, procedimento_nome")
        .eq("id", row.solicitacao_id)
        .single();
      const doc = sol
        ? selecionarDocumentos({ tipo: sol.tipo, procedimento_nome: sol.procedimento_nome }).find((d) => d.chave === row.documento_chave)
        : null;

      await admin.from("aceites_paciente").upsert(
        {
          solicitacao_id: row.solicitacao_id,
          documento_chave: row.documento_chave,
          tipo: "assinatura",
          carimbo_tempo: new Date().toISOString(),
          documento_hash: doc ? hash(doc.corpo.join("\n")) : null,
          documento_titulo: doc?.titulo ?? null,
        },
        { onConflict: "solicitacao_id,documento_chave" },
      );
    } catch {
      /* deixa para uma próxima notificação */
    }
  }

  return NextResponse.json({ ok: true });
}
