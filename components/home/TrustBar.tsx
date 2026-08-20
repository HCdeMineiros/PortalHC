import { ShieldCheck, FileSignature, Clock, Landmark } from "lucide-react";

const ITENS = [
  { icon: ShieldCheck, titulo: "Ambiente protegido", sub: "Acesso individual por código" },
  { icon: FileSignature, titulo: "Assinatura eletrônica", sub: "Documentos com registro" },
  { icon: Clock, titulo: "No seu tempo", sub: "Disponível quando precisar" },
  { icon: Landmark, titulo: "LGPD", sub: "Tratamento de dados responsável" },
];

export function TrustBar() {
  return (
    <section className="border-y border-[var(--hc-line)] bg-white/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-5 sm:px-6 lg:grid-cols-4">
        {ITENS.map(({ icon: Icon, titulo, sub }) => (
          <div key={titulo} className="flex items-center gap-3 py-6 sm:py-7">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[var(--hc-cream-2)] text-[var(--hc-red-600)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-[var(--hc-ink)]">{titulo}</span>
              <span className="block text-xs text-[var(--hc-ink-soft)]">{sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
