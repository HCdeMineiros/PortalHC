import Link from "next/link";
import { User, Stethoscope, Building2, ArrowRight } from "lucide-react";

const PERFIS = [
  {
    icon: User,
    titulo: "Sou paciente",
    texto:
      "Acesse com seu código, leia seus documentos e assine eletronicamente, com segurança e privacidade.",
    cta: "Acessar como paciente",
    href: "/paciente/acesso",
    destaque: true,
  },
  {
    icon: Stethoscope,
    titulo: "Sou médico",
    texto:
      "Cadastre cirurgias e internações a partir do catálogo de procedimentos e acompanhe cada solicitação.",
    cta: "Entrar na Área Médica",
    href: "/medico",
    destaque: false,
  },
  {
    icon: Building2,
    titulo: "Sou da equipe HC",
    texto:
      "Equipe de internação e faturamento acompanha os atendimentos, acomodações e a finalização.",
    cta: "Acesso da equipe",
    href: "/medico/login",
    destaque: false,
  },
];

export function AccessProfiles() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
      <header className="mb-10 text-center">
        <span className="hc-badge">Por onde começar</span>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)] sm:text-4xl">
          Escolha o seu acesso
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--hc-ink-soft)]">
          Cada perfil tem uma entrada própria e segura no Portal HC.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PERFIS.map(({ icon: Icon, titulo, texto, cta, href, destaque }) => (
          <Link
            key={titulo}
            href={href}
            className={`group flex flex-col rounded-2xl border p-7 transition-all hover:-translate-y-1 ${
              destaque
                ? "border-[var(--hc-red)]/25 bg-gradient-to-b from-white to-[var(--hc-cream)] shadow-[0_24px_50px_-30px_rgba(160,12,34,.45)]"
                : "border-[var(--hc-line)] bg-white shadow-[0_18px_40px_-30px_rgba(26,22,22,.35)] hover:border-[var(--hc-gold)]"
            }`}
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                destaque ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white" : "bg-[var(--hc-cream-2)] text-[var(--hc-red-600)]"
              }`}
            >
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-[var(--hc-ink)]">{titulo}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--hc-ink-soft)]">{texto}</p>
            <span className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${destaque ? "text-[var(--hc-red-600)]" : "text-[var(--hc-ink)]"}`}>
              {cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
