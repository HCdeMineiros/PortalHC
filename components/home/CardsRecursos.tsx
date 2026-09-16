import Link from "next/link";
import { FileText, PenLine, Workflow, ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    icon: FileText,
    titulo: "Seus documentos",
    texto: "Acesse os documentos do seu atendimento em um só lugar.",
    rotulo: "Organização e praticidade",
    href: "/paciente/acesso",
  },
  {
    icon: PenLine,
    titulo: "Assinatura eletrônica",
    texto: "Leia com calma e assine seus documentos pelo portal.",
    rotulo: "Tudo no seu tempo",
    href: "/paciente/acesso",
  },
  {
    icon: Workflow,
    titulo: "Cada etapa, mais clara",
    texto: "Acompanhe as etapas do seu atendimento de forma simples.",
    rotulo: "Do início à conclusão",
    href: "/paciente/acesso",
  },
];

/** Três cartões de funcionalidades, sobrepostos ao rodapé do hero. */
export function CardsRecursos() {
  return (
    <section className="bg-hc-navy-1">
      <div className="mx-auto -mt-6 grid w-full max-w-6xl gap-4 px-6 pb-14 sm:grid-cols-2 md:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.titulo}
              href={c.href}
              className="group flex min-h-[210px] flex-col rounded-[18px] border border-hc-navy-line bg-hc-surface p-6 transition-all hover:-translate-y-1 hover:border-hc-cyan/50 hover:shadow-[0_26px_50px_-30px_rgba(0,0,0,.7)]"
            >
              <Icon className="h-10 w-10 text-hc-cyan" strokeWidth={1.6} aria-hidden />
              <h3 className="font-display mt-4 text-[1.18rem] font-bold text-hc-navy-ink">{c.titulo}</h3>
              <p className="mt-1.5 flex-1 text-[.92rem] leading-relaxed text-hc-navy-soft">{c.texto}</p>
              <span className="mt-4 flex items-center justify-between border-t border-hc-navy-line pt-4 text-[.86rem] font-semibold text-hc-cyan">
                {c.rotulo}
                <ArrowUpRight className="h-4 w-4 text-hc-navy-soft transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-hc-cyan" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
