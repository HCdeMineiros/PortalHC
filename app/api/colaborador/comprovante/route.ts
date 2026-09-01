import { NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { validarEquipe } from "@/lib/supabase/validar";
import { selecionarDocumentos } from "@/lib/data/documentos-solicitacao";
import { gerarComprovantePdf } from "@/lib/pdf/comprovante";
import { HOSPITAL } from "@/lib/brand";

const mascararCpf = (v: string | null) => {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : (v ?? "-");
};

/** Gera o PDF de comprovante (ciência/assinatura) de um documento de uma solicitação. */
export async function GET(req: Request) {
  const v = await validarEquipe(req);
  if (v.erro) return v.erro;

  const url = new URL(req.url);
  const id = url.searchParams.get("solicitacao") || "";
  const chave = url.searchParams.get("doc") || "";
  if (!id || !chave) return NextResponse.json({ erro: "Parâmetros incompletos." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: sol } = await admin
    .from("solicitacoes")
    .select("numero, tipo, procedimento_nome, paciente_id, pacientes(nome, cpf)")
    .eq("id", id)
    .single();
  if (!sol) return NextResponse.json({ erro: "Solicitação não encontrada." }, { status: 404 });

  const { data: aceite } = await admin
    .from("aceites_paciente")
    .select("tipo, carimbo_tempo, ip, user_agent, nome_digitado, documento_hash, documento_titulo")
    .eq("solicitacao_id", id)
    .eq("documento_chave", chave)
    .maybeSingle();
  if (!aceite) return NextResponse.json({ erro: "Sem registro de aceite para este documento." }, { status: 404 });

  const doc = selecionarDocumentos({ tipo: sol.tipo, procedimento_nome: sol.procedimento_nome }).find((d) => d.chave === chave);
  const paciente = (sol as unknown as { pacientes?: { nome?: string; cpf?: string } }).pacientes;

  const pdf = await gerarComprovantePdf({
    hospital: HOSPITAL.nome,
    dominio: HOSPITAL.dominio,
    ehAssinatura: aceite.tipo === "assinatura",
    pacienteNome: paciente?.nome ?? "-",
    pacienteCpf: mascararCpf(paciente?.cpf ?? null),
    numeroSolicitacao: sol.numero ?? "-",
    procedimento: sol.procedimento_nome,
    documentoTitulo: doc?.titulo ?? aceite.documento_titulo ?? "Documento",
    documentoSubtitulo: doc?.subtitulo,
    corpo: doc?.corpo ?? [],
    carimboTempo: aceite.carimbo_tempo,
    ip: aceite.ip,
    userAgent: aceite.user_agent,
    nomeDigitado: aceite.nome_digitado,
    documentoHash: aceite.documento_hash,
  });

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="comprovante-${(sol.numero ?? "doc").replace(/[^\w-]/g, "")}-${chave}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
