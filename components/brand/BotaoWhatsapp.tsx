import { linkWhatsappCodigo } from "@/lib/util/whatsapp";

/**
 * Botão "Enviar/Reenviar por WhatsApp": abre o WhatsApp com a mensagem do
 * código de acesso já pronta. O colaborador envia pelo próprio WhatsApp.
 */
export function BotaoWhatsapp({
  whatsapp,
  pacienteNome,
  procedimento,
  codigo,
  rotulo = "Enviar por WhatsApp",
}: {
  whatsapp: string | null | undefined;
  pacienteNome?: string | null;
  procedimento?: string | null;
  codigo: string | null | undefined;
  rotulo?: string;
}) {
  if (!codigo) return null;
  const link = linkWhatsappCodigo({ whatsapp, pacienteNome, procedimento, codigo });
  if (!link) {
    return <span className="text-xs text-[var(--hc-ink-soft)]">Sem WhatsApp cadastrado para envio.</span>;
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.481-8.418zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885zm5.421-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
      {rotulo}
    </a>
  );
}
