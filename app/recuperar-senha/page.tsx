"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

/**
 * "Esqueci minha senha" — envia um e-mail com link para redefinir a senha.
 * Por privacidade, a resposta é sempre neutra (não revela se o e-mail existe).
 */
export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!SUPABASE_CONFIGURADO) {
      setErro("Login em preparação — o banco de dados ainda está sendo configurado.");
      return;
    }
    if (!emailValido) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setCarregando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const redirectTo = `${window.location.origin}/redefinir-senha`;
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
      // resposta neutra (não revela se o e-mail existe)
      setEnviado(true);
    } catch {
      // mesmo em erro, mostra a mensagem neutra para não vazar informação
      setEnviado(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={70} /></Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="hc-card hc-gold-frame hc-fade-up p-8">
          <span className="hc-badge">Acesso · Recuperar senha</span>

          {!enviado ? (
            <>
              <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">Esqueci minha senha</h1>
              <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
                Informe seu e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
              </p>
              <form onSubmit={enviar} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoFocus
                    className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
                  />
                </div>
                {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
                <button type="submit" disabled={carregando} className="hc-btn hc-btn-primary w-full">
                  {carregando ? "Enviando…" : "Enviar link de redefinição"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">Verifique seu e-mail</h1>
              <div className="mt-4 rounded-xl border border-[var(--hc-gold)]/50 bg-[color-mix(in_srgb,var(--hc-gold)_10%,white)] p-4 text-sm text-[var(--hc-gold-deep)]">
                Se <strong>{email.trim().toLowerCase()}</strong> estiver cadastrado, enviamos um link
                para redefinir a senha. Verifique sua caixa de entrada — e também o
                <strong> Spam / Lixo eletrônico</strong>. O link vale por tempo limitado.
              </div>
              <p className="mt-4 text-sm text-[var(--hc-ink-soft)]">
                Não chegou? Aguarde alguns minutos e tente novamente.
              </p>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/medico/login"
              className="text-sm text-[var(--hc-ink-soft)] underline-offset-2 hover:text-[var(--hc-red-600)] hover:underline"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </main>

      <Rodape />
    </>
  );
}
