import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";
import { gerarTermoPdf } from "@/lib/pdf/termo";
import { ASSINAFY_CONFIGURADO } from "@/lib/assinafy/env";
import { uploadDocumento, aguardarPronto, criarSignatario, criarAssignment } from "@/lib/assinafy/client";
import { HOSPITAL } from "@/lib/brand";

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const mascararCpf = (v: string | null) => {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : v ?? "";
};

/**
 * Inicia (ou retoma) a assinatura de um termo via Assinafy e devolve a signing_url.
 * Revalida o paciente (CPF + nascimento + código). Só para termos de consentimento.
 */
export async function POST(req: Request) {
  if (!SUPABASE_CONFIGURADO) return NextResponse.json({ erro: "Supabase não configurado." }, { status: 503 });
  if (!ASSINAFY_CONFIGURADO) return NextResponse.json({ erro: "Assinatura eletrônica ainda não configurada." }, { status: 503 });

  const b = await req.json().catch(() => null);
  const cpf = soDigitos(b?.cpf);
  const nascimento = String(b?.nascimento ?? "").trim();
  const codigo = String(b?.codigo ?? "").trim();
  const chave = String(b?.chave ?? "").trim();
  if (cpf.length !== 11 || !nascimento || !codigo || !chave) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const admin = criarClienteAdmin();
  const generico = NextResponse.json({ erro: "Sessão inválida. Acesse novamente." }, { status: 401 });

  const { data: pac } = await admin
    .from("pacientes")
    .select("id, nome, cpf, data_nascimento, telefone_whatsapp, email")
    .eq("cpf", cpf)
    .maybeSingle();
  if (!pac || String(pac.data_nascimento ?? "") !== nascimento) return generico;

  const { data: sol } = await admin
    .from("solicitacoes")
    .select("id, numero, tipo, procedimento_nome, medicos(nome)")
    .eq("paciente_id", pac.id)
    .eq("codigo_acesso_hash", hash(codigo))
    .maybeSingle();
  if (!sol) return generico;

  const doc = selecionarDocumentos({ tipo: sol.tipo, procedimento_nome: sol.procedimento_nome }).find((d) => d.chave === chave);
  if (!doc || !doc.exigeAssinatura) return NextResponse.json({ erro: "Documento não requer assinatura eletrônica." }, { status: 400 });

  // já existe registro para este documento?
  const { data: existente } = await admin
    .from("assinafy_docs")
    .select("status, signing_url")
    .eq("solicitacao_id", sol.id)
    .eq("documento_chave", chave)
    .maybeSingle();
  if (existente?.status === "assinado") return NextResponse.json({ ok: true, status: "assinado" });
  if (existente?.signing_url) return NextResponse.json({ ok: true, status: "enviado", signingUrl: existente.signing_url });

  // gera o PDF do termo
  const medicoNome = (sol as unknown as { medicos?: { nome?: string } }).medicos?.nome ?? null;
  const pdf = await gerarTermoPdf({
    hospital: HOSPITAL.nome,
    titulo: doc.titulo,
    subtitulo: doc.subtitulo,
    corpo: doc.corpo,
    pacienteNome: pac.nome,
    pacienteCpf: mascararCpf(pac.cpf),
    numeroSolicitacao: sol.numero ?? "",
    medicoNome,
    emitidoEm: new Date().toLocaleString("pt-BR"),
  });

  try {
    const nomeArq = `${sol.numero || "termo"}-${chave}`.replace(/[^\w-]/g, "");
    const documentId = await uploadDocumento(pdf, nomeArq);
    await aguardarPronto(documentId);
    const signerId = await criarSignatario({ nome: pac.nome, email: pac.email, whatsapp: pac.telefone_whatsapp });
    // verificação por WhatsApp quando houver número; senão por e-mail
    const temWhats = (pac.telefone_whatsapp ?? "").replace(/\D/g, "").length >= 10;
    const verificacao = temWhats ? "Whatsapp" : pac.email ? "Email" : "Whatsapp";
    const canais = verificacao === "Whatsapp" ? ["Whatsapp"] : ["Email"];
    const { signingUrl } = await criarAssignment(documentId, signerId, {
      mensagem: `Assinatura do ${doc.titulo} — ${HOSPITAL.nomeCurto}`,
      verificacao,
      canais,
    });

    await admin.from("assinafy_docs").upsert(
      {
        solicitacao_id: sol.id,
        documento_chave: chave,
        assinafy_document_id: documentId,
        signer_id: signerId,
        signing_url: signingUrl,
        status: signingUrl ? "enviado" : "criado",
      },
      { onConflict: "solicitacao_id,documento_chave" },
    );

    if (!signingUrl) return NextResponse.json({ erro: "Não foi possível obter o link de assinatura." }, { status: 502 });
    return NextResponse.json({ ok: true, status: "enviado", signingUrl });
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Falha na Assinafy." }, { status: 502 });
  }
}
