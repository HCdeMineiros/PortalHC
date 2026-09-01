import { ASSINAFY_ACCOUNT_ID, ASSINAFY_API_KEY, ASSINAFY_BASE_URL } from "./env";

/**
 * Cliente da API Assinafy (v1). Autenticação por X-Api-Key.
 * Fluxo: upload do PDF -> aguardar processamento -> criar signatário ->
 * criar assignment (obtém a signing_url) -> (webhook) baixar assinado.
 */

const cab = () => ({ "X-Api-Key": ASSINAFY_API_KEY });

async function comoJson(resp: Response) {
  const txt = await resp.text();
  let json: unknown = null;
  try {
    json = txt ? JSON.parse(txt) : null;
  } catch {
    /* resposta não-JSON */
  }
  if (!resp.ok) {
    const msg = (json as { message?: string })?.message || `Assinafy erro ${resp.status}`;
    throw new Error(msg);
  }
  return json as { status?: string; message?: string; data?: unknown };
}

/** Envia um PDF (bytes) e retorna o id do documento na Assinafy. */
export async function uploadDocumento(pdf: Uint8Array, nome: string): Promise<string> {
  const ab = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
  const fd = new FormData();
  fd.append("file", new Blob([ab], { type: "application/pdf" }), nome.endsWith(".pdf") ? nome : `${nome}.pdf`);
  const resp = await fetch(`${ASSINAFY_BASE_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/documents`, {
    method: "POST",
    headers: cab(),
    body: fd,
  });
  const j = await comoJson(resp);
  const id = (j.data as { id?: string })?.id;
  if (!id) throw new Error("Assinafy: upload sem id de documento.");
  return id;
}

/** Status atual do documento. */
export async function statusDocumento(documentId: string): Promise<string> {
  const resp = await fetch(`${ASSINAFY_BASE_URL}/documents/${documentId}`, { headers: cab() });
  const j = await comoJson(resp);
  return String((j.data as { status?: string })?.status ?? "");
}

const PRONTO = new Set(["metadata_ready", "ready", "pending_signature", "certificating", "certificated"]);

/** Aguarda o documento ficar pronto para receber assinatura. */
export async function aguardarPronto(documentId: string, tentativas = 12, intervaloMs = 1500): Promise<string> {
  let ultimo = "";
  for (let i = 0; i < tentativas; i++) {
    ultimo = await statusDocumento(documentId);
    if (PRONTO.has(ultimo)) return ultimo;
    if (ultimo === "failed" || ultimo === "expired") throw new Error(`Assinafy: documento ${ultimo}.`);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
  return ultimo;
}

/** Cria (ou reutiliza) um signatário. */
export async function criarSignatario(dados: { nome: string; email?: string | null; whatsapp?: string | null }): Promise<string> {
  const body: Record<string, unknown> = { full_name: dados.nome };
  if (dados.email) body.email = dados.email;
  if (dados.whatsapp) {
    const d = dados.whatsapp.replace(/\D/g, "");
    body.whatsapp_phone_number = d.startsWith("55") ? d : `55${d}`;
  }
  const resp = await fetch(`${ASSINAFY_BASE_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/signers`, {
    method: "POST",
    headers: { ...cab(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await comoJson(resp);
  const id = (j.data as { id?: string })?.id;
  if (!id) throw new Error("Assinafy: signatário sem id.");
  return id;
}

/** Cria o assignment (solicitação de assinatura) e retorna a signing_url do signatário. */
export async function criarAssignment(
  documentId: string,
  signerId: string,
  opts?: { mensagem?: string },
): Promise<{ assignmentId: string | null; signingUrl: string | null }> {
  const resp = await fetch(`${ASSINAFY_BASE_URL}/documents/${documentId}/assignments`, {
    method: "POST",
    headers: { ...cab(), "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "virtual",
      signers: [{ id: signerId }],
      ...(opts?.mensagem ? { message: opts.mensagem } : {}),
    }),
  });
  const j = await comoJson(resp);
  const data = j.data as { id?: string; signing_urls?: { signer_id?: string; url?: string }[] };
  const url = data?.signing_urls?.find((u) => u.signer_id === signerId)?.url || data?.signing_urls?.[0]?.url || null;
  return { assignmentId: data?.id ?? null, signingUrl: url };
}

/** Consulta a assinatura de webhook atual da conta (também serve de diagnóstico de auth). */
export async function consultarWebhook(): Promise<unknown> {
  const resp = await fetch(`${ASSINAFY_BASE_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/webhooks/subscriptions`, { headers: cab() });
  const j = await comoJson(resp);
  return j.data ?? null;
}

/** Registra/atualiza o webhook da conta. */
export async function registrarWebhook(url: string, email: string, eventos: string[]): Promise<unknown> {
  const resp = await fetch(`${ASSINAFY_BASE_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/webhooks/subscriptions`, {
    method: "PUT",
    headers: { ...cab(), "Content-Type": "application/json" },
    body: JSON.stringify({ url, email, events: eventos, is_active: true }),
  });
  const j = await comoJson(resp);
  return j.data ?? null;
}

/** Baixa um artefato do documento (padrão: certificado/assinado). */
export async function baixarArtefato(documentId: string, artefato = "certificated"): Promise<Uint8Array> {
  const resp = await fetch(`${ASSINAFY_BASE_URL}/documents/${documentId}/download/${artefato}`, { headers: cab() });
  if (!resp.ok) throw new Error(`Assinafy: falha ao baixar (${resp.status}).`);
  return new Uint8Array(await resp.arrayBuffer());
}
