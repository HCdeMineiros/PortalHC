import Link from "next/link";
import {
  Stethoscope,
  Bell,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Home,
  ClipboardList,
  User,
  Signal,
  Wifi,
  BatteryFull,
  Lock,
  PenLine,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* brilho de fundo extremamente discreto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,.10),transparent_60%)]" />
        <div className="absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(225,29,42,.06),transparent_60%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24">
        {/* Texto */}
        <div className="hc-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hc-gold)]/40 bg-[color-mix(in_srgb,var(--hc-gold)_10%,white)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hc-gold-deep)]">
            Hospital das Clínicas de Mineiros
          </span>
          <h1 className="mt-6 font-serif text-[2.7rem] font-semibold leading-[1.05] text-[var(--hc-ink)] sm:text-6xl">
            Seu cuidado também
            <br className="hidden sm:block" /> acontece{" "}
            <span className="text-[var(--hc-red-600)]">no digital</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--hc-ink-soft)]">
            O Portal HC reúne os serviços digitais do Hospital das Clínicas de Mineiros —
            acesso seguro aos seus documentos, etapas do atendimento e assinatura eletrônica,
            no seu tempo, onde você estiver.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/paciente/acesso"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(160,12,34,.7)] transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              <User className="h-5 w-5" aria-hidden /> Acessar como paciente
            </Link>
            <Link
              href="/medico"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--hc-line)] bg-white px-7 py-4 text-base font-semibold text-[var(--hc-ink)] transition-all hover:-translate-y-0.5 hover:border-[var(--hc-gold)]"
            >
              <Stethoscope className="h-5 w-5 text-[var(--hc-red-600)]" aria-hidden /> Área Médica
            </Link>
          </div>
        </div>

        {/* Mockup de celular */}
        <div className="relative hidden justify-center md:flex">
          <TelefoneMockup />
        </div>
      </div>
    </section>
  );
}

function TelefoneMockup() {
  return (
    <div className="relative">
      {/* cartões flutuantes */}
      <FloatCard className="-left-6 top-10" icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} texto="Dados protegidos" />
      <FloatCard className="-right-4 top-28" icon={<PenLine className="h-4 w-4 text-[var(--hc-gold-deep)]" />} texto="Documento assinado" />
      <FloatCard className="-left-2 bottom-12" icon={<Lock className="h-4 w-4 text-[var(--hc-red-600)]" />} texto="Ambiente seguro" />

      {/* aparelho */}
      <div className="relative w-[280px] rounded-[2.6rem] border border-black/10 bg-[var(--hc-ink)] p-2.5 shadow-[0_40px_80px_-30px_rgba(26,22,22,.55)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-white">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[var(--hc-ink)]" />
          {/* status bar */}
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[10px] font-semibold text-[var(--hc-ink)]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Signal className="h-3 w-3" /> <Wifi className="h-3 w-3" /> <BatteryFull className="h-3.5 w-3.5" />
            </span>
          </div>
          {/* app header */}
          <div className="flex items-center justify-between border-b border-[var(--hc-line)] px-5 py-3">
            <span className="font-serif text-sm font-semibold text-[var(--hc-ink)]">
              Portal <span className="text-[var(--hc-red-600)]">HC</span>
            </span>
            <Bell className="h-4 w-4 text-[var(--hc-ink-soft)]" />
          </div>
          {/* conteúdo */}
          <div className="space-y-3 bg-[var(--hc-cream)] px-4 py-4">
            <div>
              <p className="text-xs text-[var(--hc-ink-soft)]">Olá,</p>
              <p className="text-sm font-semibold text-[var(--hc-ink)]">Bem-vindo ao Portal HC</p>
            </div>
            <AppCard icon={<FileText className="h-4 w-4 text-[var(--hc-red-600)]" />} titulo="Documentos disponíveis" sub="Confira seus documentos" />
            <AppCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} titulo="Etapa concluída" sub="Atendimento em andamento" />
            <AppCard icon={<ShieldCheck className="h-4 w-4 text-[var(--hc-gold-deep)]" />} titulo="Acesso protegido" sub="Suas informações seguras" />
          </div>
          {/* tab bar */}
          <div className="flex items-center justify-around border-t border-[var(--hc-line)] bg-white px-4 py-2.5 text-[9px] text-[var(--hc-ink-soft)]">
            <Tab icon={<Home className="h-4 w-4 text-[var(--hc-red-600)]" />} rotulo="Início" ativo />
            <Tab icon={<FileText className="h-4 w-4" />} rotulo="Documentos" />
            <Tab icon={<ClipboardList className="h-4 w-4" />} rotulo="Atendimentos" />
            <Tab icon={<User className="h-4 w-4" />} rotulo="Perfil" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppCard({ icon, titulo, sub }: { icon: React.ReactNode; titulo: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--hc-line)] bg-white px-3 py-2.5 shadow-[0_2px_8px_-4px_rgba(26,22,22,.15)]">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--hc-cream-2)]">{icon}</span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-[var(--hc-ink)]">{titulo}</span>
        <span className="block text-[10px] text-[var(--hc-ink-soft)]">{sub}</span>
      </span>
    </div>
  );
}

function Tab({ icon, rotulo, ativo }: { icon: React.ReactNode; rotulo: string; ativo?: boolean }) {
  return (
    <span className={`flex flex-col items-center gap-0.5 ${ativo ? "text-[var(--hc-red-600)]" : ""}`}>
      {icon}
      {rotulo}
    </span>
  );
}

function FloatCard({ icon, texto, className = "" }: { icon: React.ReactNode; texto: string; className?: string }) {
  return (
    <div className={`absolute z-20 flex items-center gap-2 rounded-xl border border-[var(--hc-line)] bg-white/95 px-3 py-2 text-xs font-medium text-[var(--hc-ink)] shadow-[0_12px_28px_-14px_rgba(26,22,22,.35)] backdrop-blur ${className}`}>
      {icon}
      {texto}
    </div>
  );
}
