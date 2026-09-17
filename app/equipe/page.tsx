import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
import { BedDouble, Receipt, CircleDollarSign, Briefcase, SprayCan, Settings, ArrowRight } from "lucide-react";

const SETORES = [
  { chave: "internacao", nome: "Internação", desc: "Cadastros, acomodação e finalização dos atendimentos.", icon: BedDouble, redir: "/colaborador" },
  { chave: "faturamento", nome: "Faturamento", desc: "Finalizados e baixados, com impressão por período.", icon: Receipt, redir: "/faturamento" },
  { chave: "cobranca", nome: "Cobrança", desc: "Setor de cobrança e recebimentos.", icon: CircleDollarSign, redir: "/cobranca" },
  { chave: "administrativo", nome: "Administrativo", desc: "Área administrativa do hospital.", icon: Briefcase, redir: "/administrativo" },
  { chave: "limpeza", nome: "Manutenção de limpeza", desc: "Setor de manutenção e limpeza.", icon: SprayCan, redir: "/limpeza" },
  { chave: "gestao", nome: "Gestão do Sistema", desc: "Usuários, LGPD/DPO e configurações (acesso do gestor).", icon: Settings, redir: "/admin" },
];

export default function AcessoEquipe() {
  return (
    <>
      <FundoEscuro />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={64} variant="light" /></Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <section className="hcx-fade text-center">
          <span className="hcx-badge-d">Acesso da Equipe</span>
          <h1 className="font-display mt-5 text-4xl font-bold text-hc-navy-ink sm:text-5xl">Escolha o seu setor</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-hc-navy-soft">
            Cada setor entra com seu próprio login. Selecione o seu para continuar.
          </p>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SETORES.map(({ chave, nome, desc, icon: Icon, redir }) => (
            <Link
              key={chave}
              href={`/medico/login?setor=${chave}&redir=${encodeURIComponent(redir)}`}
              className="hcx-card-d group flex items-center gap-4 p-6 transition-all hover:-translate-y-1 hover:border-hc-cyan/50"
            >
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-hc-cyan/12 text-hc-cyan">
                <Icon className="h-7 w-7" strokeWidth={1.7} aria-hidden />
              </span>
              <span className="flex-1">
                <span className="font-display block text-xl font-bold text-hc-navy-ink">{nome}</span>
                <span className="block text-sm text-hc-navy-soft">{desc}</span>
              </span>
              <ArrowRight className="h-5 w-5 flex-none text-hc-cyan transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-hc-navy-soft">
          🔒 O acesso de cada setor é restrito: apenas quem tem a senha daquele setor consegue entrar.
        </p>
      </main>

      <RodapeEscuro />
    </>
  );
}
