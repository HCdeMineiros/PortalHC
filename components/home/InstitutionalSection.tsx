import Image from "next/image";
import { MapPin, Phone, HeartPulse } from "lucide-react";

export function InstitutionalSection() {
  return (
    <section className="bg-[var(--hc-cream)]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
        {/* foto */}
        <div className="hc-gold-frame overflow-hidden rounded-3xl">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="/brand/fachada-hc.jpg"
              alt="Fachada do Hospital das Clínicas de Mineiros"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* texto */}
        <div>
          <span className="hc-badge">Instituição</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)] sm:text-4xl">
            Hospital das Clínicas de Mineiros
          </h2>
          <p className="mt-4 text-[var(--hc-ink-soft)]">
            Referência em atendimento na região Sudoeste de Goiás, o Hospital das Clínicas de
            Mineiros une cuidado humano e tecnologia para oferecer uma experiência mais simples
            e segura aos seus pacientes.
          </p>

          <div className="mt-8 space-y-4">
            <Info icon={HeartPulse} titulo="Cuidado que continua no digital" texto="O Portal HC aproxima o paciente do hospital em cada etapa do atendimento." />
            <Info icon={MapPin} titulo="Endereço" texto="Rua Elias Carrijo Machado, Qd 02 Lt 01 — Bairro Machado, Mineiros/GO, CEP 75830-144" />
            <Info icon={Phone} titulo="Telefone" texto="(64) 3672-7282" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ icon: Icon, titulo, texto }: { icon: typeof MapPin; titulo: string; texto: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white text-[var(--hc-red-600)] shadow-[0_8px_20px_-14px_rgba(26,22,22,.5)]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--hc-ink)]">{titulo}</span>
        <span className="block text-sm text-[var(--hc-ink-soft)]">{texto}</span>
      </span>
    </div>
  );
}
