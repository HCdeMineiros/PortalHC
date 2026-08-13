/**
 * Número da solicitação: HC-DDMMAAAA-HH:MM-FICHA (horário de Brasília).
 * Ex.: HC-12082026-23:06-170170
 */
export function numeroSolicitacao(ficha: string): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const g = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return `HC-${g("day")}${g("month")}${g("year")}-${g("hour")}:${g("minute")}-${ficha}`;
}
