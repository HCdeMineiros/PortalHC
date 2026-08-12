"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";

type Etapa = "identificacao" | "otp";

export default function AcessoPaciente() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("identificacao");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [otp, setOtp] = useState("");
  const [otpEnviado, setOtpEnviado] = useState("");
  const [erro, setErro] = useState("");

  function mascararCpf(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function enviarOtp(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpfDigitos = cpf.replace(/\D/g, "");
    if (cpfDigitos.length !== 11 || !nascimento) {
      setErro("Informe o CPF completo e a data de nascimento.");
      return;
    }
    // MODO DEMONSTRAÇÃO: gera um OTP e mostra na tela.
    // No sistema real, é enviado pelo WhatsApp (n8n) e nunca exibido aqui.
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    setOtpEnviado(codigo);
    setEtapa("otp");
  }

  function validarOtp(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (otp.trim() !== otpEnviado) {
      setErro("Código incorreto. Confira o código enviado.");
      return;
    }
    router.push("/paciente/painel");
  }

  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={52} /></Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="hc-card hc-gold-frame hc-fade-up p-8">
          <span className="hc-badge">Acesso seguro · duplo fator</span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">
            {etapa === "identificacao" ? "Identifique-se" : "Confirme o código"}
          </h1>
          <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
            {etapa === "identificacao"
              ? "Para sua segurança, usamos dois fatores: seus dados e um código enviado ao seu WhatsApp."
              : "Enviamos um código de 6 dígitos ao seu WhatsApp cadastrado."}
          </p>

          {etapa === "identificacao" ? (
            <form onSubmit={enviarOtp} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">CPF</label>
                <input
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(mascararCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 text-[var(--hc-ink)] outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Data de nascimento</label>
                <input
                  type="date"
                  value={nascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 text-[var(--hc-ink)] outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
                />
              </div>
              {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
              <button type="submit" className="hc-btn hc-btn-primary w-full">
                Receber código no WhatsApp
              </button>
            </form>
          ) : (
            <form onSubmit={validarOtp} className="mt-6 space-y-4">
              <div className="rounded-xl border border-dashed border-[var(--hc-gold)] bg-[color-mix(in_srgb,var(--hc-gold)_10%,white)] p-3 text-center text-sm">
                <span className="text-[var(--hc-ink-soft)]">Modo demonstração — código gerado: </span>
                <strong className="tracking-[0.3em] text-[var(--hc-gold-deep)]">{otpEnviado}</strong>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Código de 6 dígitos</label>
                <input
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-[var(--hc-ink)] outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
                />
              </div>
              {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
              <button type="submit" className="hc-btn hc-btn-primary w-full">
                Entrar no meu portal
              </button>
              <button
                type="button"
                onClick={() => setEtapa("identificacao")}
                className="w-full text-center text-sm text-[var(--hc-ink-soft)] hover:text-[var(--hc-red-600)]"
              >
                ← Voltar
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-[var(--hc-ink-soft)]">
          🔒 Seus dados trafegam de forma criptografada e nunca são exibidos por completo.
        </p>
      </main>

      <Rodape />
    </>
  );
}
