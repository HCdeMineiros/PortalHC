import { ShieldCheck, KeyRound, FileLock2, ScrollText } from "lucide-react";

const ITENS = [
  {
    icon: KeyRound,
    titulo: "Acesso individual",
    texto: "Cada paciente entra com CPF, data de nascimento e um código exclusivo do seu atendimento.",
  },
  {
    icon: FileLock2,
    titulo: "Documentos com registro",
    texto: "As assinaturas eletrônicas ficam registradas junto ao atendimento, com data e hora.",
  },
  {
    icon: ScrollText,
    titulo: "Transparência",
    texto: "Você lê os termos e informativos antes de assinar, no seu ritmo.",
  },
  {
    icon: ShieldCheck,
    titulo: "Conforme a LGPD",
    texto: "Os dados são tratados com base na Lei Geral de Proteção de Dados (Lei 13.709/2018).",
  },
];

export function SecuritySection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="hc-badge">Segurança e privacidade</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)] sm:text-4xl">
            Seus dados tratados com responsabilidade
          </h2>
          <p className="mt-4 text-[var(--hc-ink-soft)]">
            O Portal HC foi desenhado para proteger as informações do paciente em cada etapa,
            do acesso à assinatura. Adotamos boas práticas de segurança e seguimos a Lei Geral
            de Proteção de Dados.
          </p>
          <div className="hc-gold-rule mt-8" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ITENS.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-[var(--hc-line)] bg-white p-5 shadow-[0_16px_36px_-30px_rgba(26,22,22,.4)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hc-cream-2)] text-[var(--hc-gold-deep)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-[var(--hc-ink)]">{titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--hc-ink-soft)]">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
