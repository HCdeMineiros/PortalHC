import Link from "next/link";
import Image from "next/image";

/**
 * Hero da home moderna: foto real da fachada à direita, degradê escuro à
 * esquerda para leitura, título expressivo e o acesso do paciente em destaque.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hc-navy-1">
      {/* Foto real da fachada (à direita no desktop, ao fundo no mobile) */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[72%]">
        <Image
          src="/brand/fachada-hc.jpg"
          alt="Fachada do Hospital das Clínicas de Mineiros"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_42%]"
        />
      </div>
      {/* Degradê para leitura */}
      <div className="hcx-hero-grad absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex min-h-[500px] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-14 sm:min-h-[560px]">
        <span className="hcx-fade inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-hc-navy-soft">
          <i className="h-2 w-2 flex-none rounded-full bg-hc-cyan shadow-[0_0_0_4px_rgba(56,224,198,.18)]" />
          Hospital das Clínicas de Mineiros
        </span>

        <h1 className="font-display hcx-fade d1 mt-4 max-w-[16ch] text-[clamp(2.4rem,5.6vw,4rem)] font-bold leading-[1.02] tracking-[-.015em] text-hc-navy-ink">
          O cuidado de sempre.
          <br />
          <span className="text-hc-cyan">Uma nova experiência digital.</span>
        </h1>

        <p className="hcx-fade d2 mt-5 max-w-[40ch] text-[1.06rem] leading-relaxed text-hc-navy-soft">
          Seus documentos, assinaturas e etapas do atendimento. Tudo mais próximo, em um só lugar.
        </p>

        <div className="hcx-fade d3 mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/paciente/acesso"
            className="inline-flex items-center gap-2 rounded-xl bg-hc-cyan px-6 py-4 text-base font-bold text-[var(--hc-cyan-ink)] shadow-[0_16px_34px_-14px_rgba(56,224,198,.55)] transition-all hover:-translate-y-0.5 hover:bg-hc-cyan-soft"
          >
            Acessar como paciente <span aria-hidden>↗</span>
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-1 text-[.98rem] font-semibold text-hc-navy-ink/90 transition-colors hover:text-hc-cyan"
          >
            Conheça o portal <span aria-hidden>↓</span>
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-6 hidden text-right text-xs font-semibold leading-relaxed tracking-[.06em] text-hc-navy-soft sm:block">
        <span className="tracking-[.1em] text-hc-navy-ink">NOSSA ESTRUTURA. SEU CUIDADO.</span>
        <br />
        Hospital das Clínicas · Mineiros, GO
      </div>
    </section>
  );
}
