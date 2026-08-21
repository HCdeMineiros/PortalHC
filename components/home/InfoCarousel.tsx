"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  KeyRound,
  FileSignature,
  CircleCheckBig,
  ShieldCheck,
  FileLock2,
  ScrollText,
  AlertTriangle,
  XCircle,
  BadgeCheck,
  PhoneCall,
} from "lucide-react";

const TOTAL = 3;
const INTERVALO = 9000;

export function InfoCarousel() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);

  const ir = useCallback((n: number) => setI(((n % TOTAL) + TOTAL) % TOTAL), []);
  const prox = useCallback(() => setI((v) => (v + 1) % TOTAL), []);
  const ant = useCallback(() => setI((v) => (v - 1 + TOTAL) % TOTAL), []);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setI((v) => (v + 1) % TOTAL), INTERVALO);
    return () => clearInterval(t);
  }, [pausado]);

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Informações do Portal HC"
      className="bg-[var(--hc-cream)]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:py-16">
        <div className="relative">
          {/* viewport */}
          <div
            className="overflow-hidden rounded-3xl border border-[var(--hc-line)] shadow-[0_30px_60px_-40px_rgba(26,22,22,.5)]"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            <div
              className="flex transition-transform duration-1000 ease-out"
              style={{ transform: `translateX(-${i * 100}%)` }}
            >
              <SlidePassos />
              <SlideSeguranca />
              <SlideGolpes />
            </div>
          </div>

          {/* setas */}
          <button
            onClick={ant}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--hc-line)] bg-white text-[var(--hc-ink)] shadow-[0_12px_28px_-12px_rgba(26,22,22,.5)] transition-all hover:scale-105 hover:text-[var(--hc-red-600)] sm:-left-5"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            onClick={prox}
            aria-label="Próximo"
            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--hc-line)] bg-white text-[var(--hc-ink)] shadow-[0_12px_28px_-12px_rgba(26,22,22,.5)] transition-all hover:scale-105 hover:text-[var(--hc-red-600)] sm:-right-5"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* indicadores */}
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {Array.from({ length: TOTAL }).map((_, n) => (
            <button
              key={n}
              onClick={() => ir(n)}
              aria-label={`Ir para o item ${n + 1}`}
              aria-current={i === n}
              className={`h-2.5 rounded-full transition-all ${
                i === n ? "w-8 bg-[var(--hc-red-600)]" : "w-2.5 bg-[var(--hc-line)] hover:bg-[var(--hc-gold)]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Slide 1: Como funciona ---------- */

const PASSOS = [
  { icon: UserPlus, titulo: "Cadastro pelo médico", texto: "O médico registra a cirurgia ou internação pelo catálogo de procedimentos." },
  { icon: KeyRound, titulo: "Código de acesso", texto: "O paciente recebe um código individual para entrar com segurança." },
  { icon: FileSignature, titulo: "Leitura e assinatura", texto: "No portal, o paciente lê os documentos e assina eletronicamente." },
  { icon: CircleCheckBig, titulo: "Acompanhamento da equipe", texto: "A equipe do HC acompanha as etapas e a finalização do atendimento." },
];

function SlidePassos() {
  return (
    <div className="w-full flex-none bg-[var(--hc-cream-2)] px-6 py-12 sm:px-12 sm:py-14">
      <div className="text-center">
        <span className="hc-badge">Como funciona</span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-[var(--hc-ink)] sm:text-3xl">
          Quatro passos, do cadastro à assinatura
        </h2>
      </div>
      <ol className="mx-auto mt-9 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map(({ icon: Icon, titulo, texto }, n) => (
          <li key={titulo} className="relative rounded-2xl border border-[var(--hc-line)] bg-white p-5 text-left">
            <span className="absolute right-4 top-3 font-serif text-3xl font-semibold text-[var(--hc-gold)]/35">{n + 1}</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hc-cream-2)] text-[var(--hc-red-600)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-[var(--hc-ink)]">{titulo}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--hc-ink-soft)]">{texto}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Slide 2: Segurança e privacidade ---------- */

const SEGURANCA = [
  { icon: KeyRound, titulo: "Acesso individual", texto: "Entrada com CPF, data de nascimento e um código exclusivo do atendimento." },
  { icon: FileLock2, titulo: "Documentos com registro", texto: "Assinaturas eletrônicas registradas junto ao atendimento, com data e hora." },
  { icon: ScrollText, titulo: "Transparência", texto: "Você lê os termos e informativos antes de assinar, no seu ritmo." },
  { icon: ShieldCheck, titulo: "Conforme a LGPD", texto: "Dados tratados com base na Lei Geral de Proteção de Dados (Lei 13.709/2018)." },
];

function SlideSeguranca() {
  return (
    <div className="w-full flex-none bg-white px-6 py-12 sm:px-12 sm:py-14">
      <div className="text-center">
        <span className="hc-badge">Segurança e privacidade</span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-[var(--hc-ink)] sm:text-3xl">
          Seus dados tratados com responsabilidade
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--hc-ink-soft)]">
          O Portal HC protege as informações do paciente em cada etapa, do acesso à assinatura,
          seguindo a Lei Geral de Proteção de Dados.
        </p>
      </div>
      <div className="mx-auto mt-9 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEGURANCA.map(({ icon: Icon, titulo, texto }) => (
          <div key={titulo} className="rounded-2xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--hc-gold-deep)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-[var(--hc-ink)]">{titulo}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--hc-ink-soft)]">{texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Slide 3: Alerta contra golpes ---------- */

const ALERTAS: { tipo: "x" | "ok"; texto: React.ReactNode }[] = [
  { tipo: "x", texto: "O hospital não solicita senhas, dados bancários ou chaves Pix por mensagem." },
  {
    tipo: "ok",
    texto: (
      <>
        Qualquer pagamento deve ser feito em nome do{" "}
        <strong className="font-semibold">Hospital das Clínicas de Mineiros</strong> — Pix (CNPJ){" "}
        <strong className="font-semibold">37.412.400/0001-14</strong>.
      </>
    ),
  },
  { tipo: "x", texto: "Desconfie de links, boletos e pagamentos fora dos canais oficiais." },
];

function SlideGolpes() {
  return (
    <div className="relative w-full flex-none overflow-hidden bg-gradient-to-br from-[var(--hc-red-700)] via-[#7c1020] to-[var(--hc-ink)] px-6 py-12 text-[var(--hc-cream)] sm:px-12 sm:py-14">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hc-gold)]/50 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold-soft,#e7cf7a)]">
            <AlertTriangle className="h-4 w-4" aria-hidden /> Atenção — segurança
          </span>
          <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
            Proteger você contra golpes também é cuidar
          </h2>
        </div>

        <ul className="mx-auto mt-8 grid max-w-3xl items-stretch gap-3 sm:grid-cols-3">
          {ALERTAS.map((a, n) => (
            <li
              key={n}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                a.tipo === "ok" ? "border-[var(--hc-gold)]/50 bg-white/10" : "border-white/15 bg-white/5"
              }`}
            >
              {a.tipo === "ok" ? (
                <BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-300" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-none text-[var(--hc-gold-soft,#e7cf7a)]" aria-hidden />
              )}
              <span className="text-[color-mix(in_srgb,var(--hc-cream)_92%,transparent)]">{a.texto}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-[color-mix(in_srgb,var(--hc-cream)_85%,transparent)]">
            Em caso de cobrança suspeita, fale com os canais oficiais do hospital.
          </p>
          <a
            href="tel:+556436727282"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--hc-cream)] px-6 py-3 text-sm font-semibold text-[var(--hc-ink)] transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <PhoneCall className="h-4 w-4" aria-hidden /> (64) 3672-7282
          </a>
        </div>
      </div>
    </div>
  );
}
