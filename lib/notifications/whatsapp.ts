/**
 * Envia o código de acesso ao paciente via WhatsApp, disparando o webhook do n8n.
 * Não acopla regra de negócio ao canal: aqui só decidimos QUE enviar; o n8n envia COMO.
 * Se o webhook não estiver configurado, é um no-op (o médico ainda vê o código na tela).
 */
export async function enviarCodigoWhatsapp(dados: {
  whatsapp: string;
  pacienteNome: string;
  codigo: string;
  numero: string;
  procedimento: string;
}): Promise<{ enviado: boolean; motivo?: string }> {
  const url = process.env.N8N_WEBHOOK_URL ?? "";
  if (!url) return { enviado: false, motivo: "n8n não configurado" };

  const whats = (dados.whatsapp || "").replace(/\D/g, "");
  if (!whats) return { enviado: false, motivo: "paciente sem WhatsApp" };

  const link = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.portalhc.com.br") + "/paciente/acesso";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        tipo: "codigo_acesso_paciente",
        paciente_nome: dados.pacienteNome,
        whatsapp: whats,
        codigo: dados.codigo,
        numero: dados.numero,
        procedimento: dados.procedimento,
        link,
      }),
    });
    return resp.ok ? { enviado: true } : { enviado: false, motivo: `n8n respondeu ${resp.status}` };
  } catch {
    return { enviado: false, motivo: "falha ao chamar o n8n" };
  }
}
