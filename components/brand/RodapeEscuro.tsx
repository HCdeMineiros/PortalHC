import { HOSPITAL } from "@/lib/brand";

/** Rodapé compacto (tema escuro) para as telas de acesso. */
export function RodapeEscuro() {
  return (
    <footer className="mt-auto border-t border-hc-navy-line bg-hc-navy-0 text-hc-navy-soft">
      <div className="mx-auto max-w-5xl px-6 py-8 text-center">
        <p className="font-display text-base font-semibold text-hc-navy-ink">{HOSPITAL.nome}</p>
        <p className="mt-1 text-sm">
          {HOSPITAL.endereco} · CEP {HOSPITAL.cep} · {HOSPITAL.cidade}
        </p>
        <p className="mt-1 text-sm">{HOSPITAL.telefones.join(" · ")}</p>
        <p className="mt-3 text-xs text-hc-navy-dim">
          © {new Date().getFullYear()} {HOSPITAL.nomeCurto} · {HOSPITAL.dominio} · Dados protegidos conforme a LGPD.
        </p>
        <p className="mt-1 text-[11px] text-hc-navy-dim/80">
          Versão de demonstração do projeto — dados fictícios, sem informações reais de pacientes.
        </p>
      </div>
    </footer>
  );
}
