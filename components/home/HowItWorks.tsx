import { UserPlus, KeyRound, FileSignature, CircleCheckBig } from "lucide-react";

const PASSOS = [
  {
    icon: UserPlus,
    titulo: "Cadastro pelo médico",
    texto: "O médico registra a cirurgia ou internação a partir do catálogo de procedimentos.",
  },
  {
    icon: KeyRound,
    titulo: "Código de acesso",
    texto: "O paciente recebe um código individual para entrar no portal com segurança.",
  },
  {
    icon: FileSignature,
    titulo: "Leitura e assinatura",
    texto: "No portal, o paciente lê os documentos e termos e assina eletronicamente.",
  },
  {
    icon: CircleCheckBig,
    titulo: "Acompanhamento da equipe",
    texto: "A equipe do HC acompanha as etapas, a acomodação e a finalização do atendimento.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[var(--hc-cream-2)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
        <header className="mb-12 text-center">
          <span className="hc-badge">Como funciona</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)] sm:text-4xl">
            Quatro passos, do cadastro à assinatura
          </h2>
        </header>

        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map(({ icon: Icon, titulo, texto }, i) => (
            <li
              key={titulo}
              className="relative rounded-2xl border border-[var(--hc-line)] bg-white p-6 shadow-[0_18px_40px_-32px_rgba(26,22,22,.4)]"
            >
              <span className="absolute right-5 top-5 font-serif text-4xl font-semibold text-[var(--hc-gold)]/35">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hc-cream-2)] text-[var(--hc-red-600)]">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-[var(--hc-ink)]">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--hc-ink-soft)]">{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
