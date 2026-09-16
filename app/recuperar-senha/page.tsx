"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
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
      <FundoEscuro />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={64} variant="light" /></Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="hcx-card-d hcx-fade p-8">
          <span className="hcx-badge-d">Acesso · Recuperar senha</span>

          {!enviado ? (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Esqueci minha senha</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Informe seu e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
              </p>
              <form onSubmit={enviar} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoFocus
                    className="hcx-field"
                  />
                </div>
                {erro && <p className="text-sm text-[#FF9BA3]">{erro}</p>}
                <button type="submit" disabled={carregando} className="hcx-btn-cy w-full">
                  {carregando ? "Enviando…" : "Enviar link de redefinição"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Verifique seu e-mail</h1>
              <div className="mt-4 rounded-xl border border-hc-cyan/40 bg-hc-cyan/10 p-4 text-sm text-hc-navy-ink">
                Se <strong>{email.trim().toLowerCase()}</strong> estiver cadastrado, enviamos um link
                para redefinir a senha. Verifique sua caixa de entrada — e também o
                <strong> Spam / Lixo eletrônico</strong>. O link vale por tempo limitado.
              </div>
              <p className="mt-4 text-sm text-hc-navy-soft">
                Não chegou? Aguarde alguns minutos e tente novamente.
              </p>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/medico/login"
              className="text-sm text-hc-navy-soft underline-offset-2 transition-colors hover:text-hc-cyan hover:underline"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </main>

      <RodapeEscuro />
    </>
  );
}
