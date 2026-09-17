/**
 * Envio de WhatsApp pelo número do hospital via WhatsApp Cloud API oficial (Meta).
 * Chamada DIRETA a graph.facebook.com (sem n8n).
 *
 * Configuração (Vercel env):
 *   WHATSAPP_TOKEN            -> token permanente (Usuário do Sistema) — obrigatório p/ enviar
 *   WHATSAPP_PHONE_NUMBER_ID  -> ID do número (Phone Number ID) — obrigatório
 *   WHATSAPP_API_VERSION      -> versão da API (default "v21.0")
 *   WHATSAPP_TEMPLATE_LANG    -> idioma dos modelos (default "pt_BR")
 *   WHATSAPP_TEMPLATE_AVISO   -> nome do modelo Utilidade "aviso + link" (2 variáveis: nome, procedimento)
 *   WHATSAPP_TEMPLATE_CODIGO  -> nome do modelo Autenticação do código (opcional; vazio = não envia)
 *   WHATSAPP_TEMPLATE_ASSINATURA -> nome do modelo Utilidade do link de assinatura (opcional)
 *
 * Sem WHATSAPP_TOKEN/PHONE_NUMBER_ID, tudo vira no-op silencioso (o fluxo do
 * sistema continua; o médico ainda vê o código na tela).
 */

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");

function cfg() {
  return {
    token: process.env.WHATSAPP_TOKEN ?? "",
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    version: process.env.WHATSAPP_API_VERSION || "v21.0",
    lang: process.env.WHATSAPP_TEMPLATE_LANG || "pt_BR",
    tplAviso: process.env.WHATSAPP_TEMPLATE_AVISO || "",
    tplCodigo: process.env.WHATSAPP_TEMPLATE_CODIGO || "",
    tplAssinatura: process.env.WHATSAPP_TEMPLATE_ASSINATURA || "",
  };
}

export function whatsappConfigurado(): boolean {
  const { token, phoneId } = cfg();
  return Boolean(token && phoneId);
}

/** Normaliza para E.164 do Brasil (só dígitos, com 55). */
function paraBrasil(whatsapp: string): string | null {
  const d = soDigitos(whatsapp);
  if (d.length < 10) return null;
  return d.startsWith("55") ? d : `55${d}`;
}

type Resultado = { enviado: boolean; motivo?: string };

/** Envia um template do WhatsApp com parâmetros de corpo (texto). */
async function enviarTemplate(
  to: string,
  templateName: string,
  bodyParams: string[],
): Promise<Resultado> {
  const { token, phoneId, version, lang } = cfg();
  if (!token || !phoneId) return { enviado: false, motivo: "WhatsApp não configurado" };
  if (!templateName) return { enviado: false, motivo: "modelo não configurado" };

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: lang },
      ...(bodyParams.length
        ? { components: [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) }] }
        : {}),
    },
  };

  try {
    const resp = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.ok) return { enviado: true };
    const txt = await resp.text().catch(() => "");
    return { enviado: false, motivo: `Meta ${resp.status}: ${txt.slice(0, 200)}` };
  } catch {
    return { enviado: false, motivo: "falha ao chamar a Cloud API" };
  }
}

/**
 * 1) Ao cadastrar a cirurgia: avisa o paciente (nome + procedimento + link do portal)
 *    e, se houver modelo de código configurado, envia também o código de acesso.
 */
export async function enviarCodigoWhatsapp(dados: {
  whatsapp: string;
  pacienteNome: string;
  codigo: string;
  numero: string;
  procedimento: string;
}): Promise<Resultado> {
  const to = paraBrasil(dados.whatsapp);
  if (!to) return { enviado: false, motivo: "paciente sem WhatsApp válido" };
  const { tplAviso, tplCodigo } = cfg();

  // Aviso (Utilidade): {{1}} nome, {{2}} procedimento
  const aviso = await enviarTemplate(to, tplAviso, [dados.pacienteNome, dados.procedimento]);

  // Código (Autenticação) — só se configurado
  if (tplCodigo) {
    await enviarTemplate(to, tplCodigo, [dados.codigo]).catch(() => {});
  }

  return aviso;
}

/** 2) Ao iniciar a assinatura: envia o link direto de assinatura (se houver modelo configurado). */
export async function enviarLinkAssinaturaWhatsapp(dados: {
  whatsapp: string;
  pacienteNome: string;
  documentoTitulo: string;
  signingUrl: string;
}): Promise<Resultado> {
  const to = paraBrasil(dados.whatsapp);
  if (!to) return { enviado: false, motivo: "paciente sem WhatsApp válido" };
  const { tplAssinatura } = cfg();
  if (!tplAssinatura) return { enviado: false, motivo: "modelo de assinatura não configurado" };
  return enviarTemplate(to, tplAssinatura, [dados.pacienteNome, dados.documentoTitulo, dados.signingUrl]);
}
