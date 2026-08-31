"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { CampoSenha } from "@/components/brand/CampoSenha";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

export default function LoginMedico() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ehMedico, setEhMedico] = useState(false);
  const [setor, setSetor] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redir = params.get("redir") || "";
    setEhMedico(redir.startsWith("/medico"));
    setSetor(params.get("setor") || "");
  }, []);

  const SETOR_LABEL: Record<string, string> = {
    internacao: "Internação",
    faturamento: "Faturamento",
    cobranca: "Cobrança",
    administrativo: "Administrativo",
    limpeza: "Manutenção de limpeza",
    gestao: "Gestão do Sistema",
  };
  const badge = setor && SETOR_LABEL[setor]
    ? `Acesso · ${SETOR_LABEL[setor]}`
    : ehMedico
      ? "Acesso do Médico · restrito"
      : "Acesso da Equipe · restrito";

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!SUPABASE_CONFIGURADO) {
      setErro("Login em preparação — o banco de dados ainda está sendo configurado.");
      return;
    }
    setCarregando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data: entrada, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro("E-mail ou senha inválidos.");
        return;
      }
      // direciona conforme o papel
      // se veio de uma área protegida, volta para lá; senão, roteia por papel
      const redir = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redir") : null;
      let destino = "/medico";
      if (redir && redir.startsWith("/") && !redir.startsWith("//")) {
        destino = redir;
      } else {
        const uid = entrada.user?.id;
        if (uid) {
          const { data: perfil } = await supabase.from("usuarios").select("papel").eq("id", uid).single();
          const p = perfil?.papel;
          if (p === "admin_dpo" || p === "internacao" || p === "faturamento") destino = "/colaborador";
          else if (p === "administrativo") destino = "/administrativo";
          else if (p === "cobranca") destino = "/cobranca";
          else if (p === "limpeza") destino = "/limpeza";
        }
      }
      router.push(destino);
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
          <span className="hc-badge">{badge}</span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
            Médicos e colaboradores. Use seu e-mail e senha; você vai direto para a sua área.
          </p>

          {!SUPABASE_CONFIGURADO && (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--hc-gold)] bg-[color-mix(in_srgb,var(--hc-gold)_10%,white)] p-3 text-center text-sm text-[var(--hc-gold-deep)]">
              Ambiente de demonstração — o login real é ativado quando o banco de dados
              (Supabase) for conectado.
            </div>
          )}

          <form onSubmit={entrar} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ehMedico ? "medico@portalhc.com.br" : "equipe@portalhc.com.br"}
                className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Senha</label>
              <CampoSenha
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
              />
            </div>
            {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
            <button type="submit" disabled={carregando} className="hc-btn hc-btn-primary w-full">
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-[var(--hc-ink-soft)]">
          🔒 Autenticação com dois fatores (MFA) será habilitada para colaboradores.
        </p>
      </main>

      <Rodape />
    </>
  );
}
