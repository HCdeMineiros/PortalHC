import Link from "next/link";
import { MapPin, Phone, ShieldAlert, ShieldCheck, Globe } from "lucide-react";
import { HOSPITAL } from "@/lib/brand";

const PORTAL = [
  { rotulo: "Acesso do paciente", href: "/paciente/acesso" },
  { rotulo: "Área médica", href: "/medico" },
  { rotulo: "Acesso da equipe", href: "/equipe" },
];

const tel = (t: string) => `tel:+55${t.replace(/\D/g, "")}`;

/** Rodapé completo da home moderna: dados do hospital, contatos, antigolpe e LGPD. */
export function FooterHome() {
  const ano = new Date().getFullYear();
  return (
    <footer className="bg-hc-navy-0 text-hc-navy-soft">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Marca / instituição */}
        <div>
          <p className="font-display text-lg font-bold text-hc-navy-ink">{HOSPITAL.nome}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Portal oficial de internação e cirurgia — documentos e assinaturas em um acesso seguro,
            para pacientes e equipe.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-hc-navy-line bg-white/5 px-3 py-1.5 text-xs font-semibold text-hc-navy-ink">
            <ShieldCheck className="h-4 w-4 text-hc-cyan" aria-hidden />
            Conforme a LGPD
          </span>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-hc-navy-dim">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-hc-cyan" aria-hidden />
              <span>{HOSPITAL.endereco}<br />{HOSPITAL.cidade} · CEP {HOSPITAL.cep}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 flex-none text-hc-cyan" aria-hidden />
              <span className="flex flex-col">
                {HOSPITAL.telefones.map((t) => (
                  <a key={t} href={tel(t)} className="transition-colors hover:text-hc-cyan">{t}</a>
                ))}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 flex-none text-hc-cyan" aria-hidden />
              <span>{HOSPITAL.dominio}</span>
            </li>
            <li className="pt-1 text-xs text-hc-navy-dim">CNPJ {HOSPITAL.cnpj}</li>
          </ul>
        </div>

        {/* Portal */}
        <nav aria-label="Portal">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-hc-navy-dim">Portal</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PORTAL.map((l) => (
              <li key={l.rotulo}>
                <Link href={l.href} className="transition-colors hover:text-hc-cyan">{l.rotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Antigolpe / segurança */}
        <div className="rounded-[16px] border border-hc-navy-line bg-white/[.03] p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-hc-navy-ink">
            <ShieldAlert className="h-5 w-5 flex-none text-[#F6C453]" aria-hidden />
            Cuidado com golpes
          </h3>
          <p className="mt-2 text-[.86rem] leading-relaxed">
            O hospital <strong className="text-hc-navy-ink">nunca solicita pagamento</strong> por links ou
            mensagens. Na dúvida, ligue para os telefones oficiais e confira sempre nosso CNPJ:
          </p>
          <code className="mt-3 inline-block rounded-lg border border-hc-navy-line bg-black/20 px-3 py-1.5 font-mono text-[.85rem] tracking-[.02em] text-hc-navy-ink">
            {HOSPITAL.cnpj}
          </code>
        </div>
      </div>

      <div className="border-t border-hc-navy-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-center text-xs text-hc-navy-dim md:flex-row md:text-left">
          <span>© {ano} {HOSPITAL.nomeCurto} · {HOSPITAL.dominio}</span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-hc-cyan" aria-hidden />
            Dados protegidos conforme a LGPD
          </span>
        </div>
        <p className="pb-6 text-center text-[11px] text-hc-navy-dim/80">
          Versão de demonstração do projeto — dados fictícios, sem informações reais de pacientes.
        </p>
      </div>
    </footer>
  );
}
