/**
 * Envio de WhatsApp pelo NOSSO número (não pela Assinafy).
 * O Portal HC só decide O QUE enviar; o disparo real é feito pelo n8n,
 * que fala com a WhatsApp Cloud API oficial (Meta) usando o número do hospital.
 *
 * Configuração (Vercel env):
 *   N8N_WEBHOOK_URL     -> URL do webhook do fluxo no n8n (obrigatória p/ enviar)
 *   N8N_WEBHOOK_SECRET  -> segredo opcional enviado no header x-webhook-secret
 *   NEXT_PUBLIC_APP_URL -> base do portal (default https://www.portalhc.com.br)
 *
 * Sem N8N_WEBHOOK_URL configurada, tudo vira no-op silencioso: o fluxo do
 * sistema continua normalmente (o médico ainda vê o código na tela).
 */

const soDigitos = (s: string) => String(s ?? "").replace(/\D/g, "");
const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://www.portalhc.com.br";

type Resultado = { enviado: boolean; motivo?: string };

/**
 * Dispara uma mensagem para o n8n. `tipo` identifica o template/fluxo no n8n;
 * `dados` são os campos que o n8n usa para montar a mensagem.
 */
async function dispararN8n(tipo: string, whatsapp: string, dados: Record<string, unknown>): Promise<Resultado> {
  const url = process.env.N8N_WEBHOOK_URL ?? "";
  if (!url) return { enviado: false, motivo: "n8n não configurado" };

  const whats = soDigitos(whatsapp);
  if (whats.length < 10) return { enviado: false, motivo: "paciente sem WhatsApp válido" };
  const numero = whats.startsWith("55") ? whats : `55${whats}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ tipo, whatsapp: numero, ...dados }),
    });
    return resp.ok ? { enviado: true } : { enviado: false, motivo: `n8n respondeu ${resp.status}` };
  } catch {
    return { enviado: false, motivo: "falha ao chamar o n8n" };
  }
}

/** 1) Ao cadastrar a cirurgia: manda o código de acesso + link do portal. */
export async function enviarCodigoWhatsapp(dados: {
  whatsapp: string;
  pacienteNome: string;
  codigo: string;
  numero: string;
  procedimento: string;
}): Promise<Resultado> {
  return dispararN8n("codigo_acesso_paciente", dados.whatsapp, {
    paciente_nome: dados.pacienteNome,
    codigo: dados.codigo,
    numero: dados.numero,
    procedimento: dados.procedimento,
    link: `${appUrl()}/paciente/acesso`,
  });
}

/** 2) Ao iniciar a assinatura: manda o link direto de assinatura do termo. */
export async function enviarLinkAssinaturaWhatsapp(dados: {
  whatsapp: string;
  pacienteNome: string;
  documentoTitulo: string;
  signingUrl: string;
}): Promise<Resultado> {
  return dispararN8n("link_assinatura", dados.whatsapp, {
    paciente_nome: dados.pacienteNome,
    documento_titulo: dados.documentoTitulo,
    signing_url: dados.signingUrl,
  });
}
