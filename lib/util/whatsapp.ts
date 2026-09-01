/**
 * Monta um link "clique para conversar" (wa.me) com a mensagem do código de
 * acesso já preenchida. O colaborador clica e envia pelo próprio WhatsApp —
 * não precisa de API nem número dedicado.
 */
export function linkWhatsappCodigo(opts: {
  whatsapp: string | null | undefined;
  pacienteNome?: string | null;
  procedimento?: string | null;
  codigo: string;
}): string | null {
  const d = String(opts.whatsapp ?? "").replace(/\D/g, "");
  if (d.length < 10) return null; // sem número válido
  const ddi = d.startsWith("55") ? d : `55${d}`;
  const nome = opts.pacienteNome ? ` ${opts.pacienteNome}` : "";
  const proc = opts.procedimento ? ` (${opts.procedimento})` : "";
  const msg =
    `Olá${nome}! Aqui é do Hospital das Clínicas de Mineiros. ` +
    `Seu atendimento${proc} foi registrado no Portal HC. ` +
    `Seu código de acesso é ${opts.codigo}. ` +
    `Acesse www.portalhc.com.br e entre com CPF, data de nascimento e este código para ler e assinar seus documentos. ` +
    `Qualquer dúvida, estamos à disposição.`;
  return `https://wa.me/${ddi}?text=${encodeURIComponent(msg)}`;
}
