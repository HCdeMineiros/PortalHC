import { HOSPITAL } from "@/lib/brand";

export function Rodape() {
  return (
    <footer className="mt-auto border-t border-[var(--hc-line)] bg-[color-mix(in_srgb,var(--hc-white)_70%,var(--hc-cream))]">
      <div className="mx-auto max-w-5xl px-6 py-8 text-center">
        <hr className="hc-gold-rule mb-6" />
        <p className="font-serif text-lg text-[var(--hc-ink)]">
          {HOSPITAL.nome}
        </p>
        <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
          {HOSPITAL.endereco} · CEP {HOSPITAL.cep} · {HOSPITAL.cidade}
        </p>
        <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
          {HOSPITAL.telefones.join(" · ")}
        </p>
        <p className="mt-4 text-xs text-[var(--hc-ink-soft)]">
          © {new Date().getFullYear()} {HOSPITAL.nomeCurto} · {HOSPITAL.dominio} ·
          Ambiente seguro, dados protegidos conforme a LGPD.
        </p>
        <p className="mt-1 text-[11px] text-[var(--hc-ink-soft)]/80">
          Versão de demonstração do projeto — dados fictícios, sem informações reais de pacientes.
        </p>
      </div>
    </footer>
  );
}
