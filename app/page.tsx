import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { BotaoMedico } from "@/components/brand/BotaoMedico";

export default function Home() {
  return (
    <>
      {/* Fio dourado no topo absoluto */}
      <div className="hc-gold-rule" />

      {/* HERO cinematográfico — fachada do hospital em tela cheia */}
      <section className="hc-hero relative isolate flex min-h-[92svh] flex-col">
        <div className="hc-hero-photo absolute inset-0 -z-20" />
        <div className="hc-hero-overlay absolute inset-0 -z-10" />

        {/* Cabeçalho sobreposto */}
        <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
          <Logo height={92} variant="light" />
          <BotaoMedico variant="glass" />
        </header>

        {/* Conteúdo do hero */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
          <span className="hc-badge hc-fade-up border-white/30 !bg-white/10 !text-[var(--hc-gold-soft)] backdrop-blur-sm">
            Hospital das Clínicas &ldquo;Dr. Neves&rdquo; · Mineiros-GO
          </span>
          <h1 className="hc-fade-up mt-7 max-w-4xl font-serif text-[2.6rem] font-semibold leading-[1.05] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,.5)] sm:text-7xl">
            Cuidado que começa
            <br className="hidden sm:block" />
            <span className="text-[var(--hc-gold-soft)]"> antes da sua internação.</span>
          </h1>
          <p className="hc-fade-up mx-auto mt-6 max-w-2xl text-lg text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,.55)] sm:text-xl">
            Leia e assine eletronicamente os termos de consentimento no seu tempo, com
            segurança e validade jurídica. Transparência do início ao fim, em conformidade
            com a LGPD.
          </p>
          <div className="hc-fade-up mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/paciente/acesso" className="hc-btn hc-btn-primary w-full px-8 py-4 text-base sm:w-auto">
              Sou paciente — acessar meus documentos
            </Link>
            <Link
              href="/colaborador"
              className="hc-btn w-full border border-white/40 bg-white/10 px-7 py-4 text-base text-white backdrop-blur-md hover:bg-white/20 sm:w-auto"
            >
              Acesso da equipe
            </Link>
          </div>
        </div>

        {/* Selos de confiança na base do hero */}
        <div className="relative border-t border-white/15 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-5 text-center sm:grid-cols-4">
            {[
              ["🔒", "Dados criptografados"],
              ["✍️", "Assinatura Lei 14.063/2020"],
              ["🛡️", "Conforme a LGPD"],
              ["📱", "No seu WhatsApp"],
            ].map(([ic, t]) => (
              <div key={t} className="flex items-center justify-center gap-2 text-sm text-white/90">
                <span aria-hidden>{ic}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção clara — como funciona */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="py-16 text-center">
          <span className="hc-badge">Como funciona</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)] sm:text-4xl">
            Simples para você, seguro para todos
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                t: "Leia com antecedência",
                d: "Você recebe os termos pelo WhatsApp e lê no seu tempo, sem pressa, antes do procedimento.",
              },
              {
                t: "Assine com validade jurídica",
                d: "Assinatura eletrônica avançada com trilha de auditoria e verificação por QR Code.",
              },
              {
                t: "Tudo protegido",
                d: "Dados de saúde tratados como sensíveis, armazenamento seguro e acesso com duplo fator.",
              },
            ].map((c, i) => (
              <div key={i} className="hc-card hc-gold-frame p-7 text-left">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--hc-red-050)] font-serif text-lg font-bold text-[var(--hc-red-600)]">
                  {i + 1}
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--hc-ink)]">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--hc-ink-soft)]">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Faixa de destaque para o médico */}
        <section className="hc-card-elevated hc-gold-frame mb-16 overflow-hidden">
          <div className="grid items-center gap-6 p-8 sm:grid-cols-[1.5fr_1fr] sm:p-10">
            <div>
              <span className="hc-badge">Para o corpo clínico</span>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-[var(--hc-ink)]">
                Cadastre a cirurgia em minutos
              </h2>
              <p className="mt-2 max-w-xl text-[var(--hc-ink-soft)]">
                Selecione o procedimento no banco de cirurgias, vincule o paciente e deixe o
                Portal HC cuidar dos termos, do envio e da assinatura. Você acompanha tudo.
              </p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <BotaoMedico />
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
