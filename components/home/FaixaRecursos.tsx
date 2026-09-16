import { KeyRound, FileSignature, Cpu } from "lucide-react";

const ITENS = [
  { icon: KeyRound, texto: "Acesso individual por código" },
  { icon: FileSignature, texto: "Documentos e assinaturas" },
  { icon: Cpu, texto: "Tecnologia a serviço do cuidado" },
];

/** Faixa fina com os pilares do portal. */
export function FaixaRecursos() {
  return (
    <section className="border-y border-hc-navy-line bg-hc-navy-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        {ITENS.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.texto} className="flex items-center gap-3 text-[.9rem] font-semibold text-hc-navy-soft">
              <Icon className="h-[22px] w-[22px] flex-none text-hc-cyan" strokeWidth={1.6} aria-hidden />
              {it.texto}
            </div>
          );
        })}
      </div>
    </section>
  );
}
