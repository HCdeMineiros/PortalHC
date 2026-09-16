"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
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
  const [inatividade, setInatividade] = useState(false);
  // troca obrigatória de senha no 1º acesso
  const [fase, setFase] = useState<"login" | "nova">("login");
  const [destino, setDestino] = useState("/medico");
  const [novaSenha, setNovaSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redir = params.get("redir") || "";
    setEhMedico(redir.startsWith("/medico"));
    setSetor(params.get("setor") || "");
    setInatividade(params.get("motivo") === "inatividade");
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
      // senha provisória → obriga a trocar antes de entrar
      const provisoria = entrada.user?.app_metadata?.trocar_senha === true;
      if (provisoria) {
        setDestino(destino);
        setFase("nova");
        return;
      }
      router.push(destino);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (novaSenha.length < 6) return setErro("A nova senha deve ter ao menos 6 caracteres.");
    if (novaSenha !== confSenha) return setErro("A confirmação da nova senha não confere.");
    setCarregando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setErro("Sessão expirada. Entre novamente.");
        setFase("login");
        return;
      }
      const resp = await fetch("/api/usuario/senha-inicial", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ novaSenha }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setErro(json?.erro || "Não foi possível trocar a senha.");
        return;
      }
      router.push(destino);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const campoCls = "hcx-field";

  return (
    <>
      <FundoEscuro />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={64} variant="light" /></Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="hcx-card-d hcx-fade p-8">
          <span className="hcx-badge-d">{badge}</span>
          {fase === "login" ? (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Entrar</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Médicos e colaboradores. Use seu e-mail e senha; você vai direto para a sua área.
              </p>

              {inatividade && (
                <div className="mt-5 rounded-xl border border-hc-cyan/40 bg-hc-cyan/10 p-3 text-center text-sm text-hc-cyan">
                  Sua sessão foi encerrada por inatividade (30 minutos). Entre novamente.
                </div>
              )}

              {!SUPABASE_CONFIGURADO && (
                <div className="mt-5 rounded-xl border border-dashed border-hc-cyan/50 bg-hc-cyan/10 p-3 text-center text-sm text-hc-cyan">
                  Ambiente de demonstração — o login real é ativado quando o banco de dados
                  (Supabase) for conectado.
                </div>
              )}

              <form onSubmit={entrar} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ehMedico ? "medico@portalhc.com.br" : "equipe@portalhc.com.br"}
                    className={campoCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">Senha</label>
                  <CampoSenha
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    tone="escuro"
                    className={campoCls}
                  />
                </div>
                {erro && <p className="text-sm text-[#FF9BA3]">{erro}</p>}
                <button type="submit" disabled={carregando} className="hcx-btn-cy w-full">
                  {carregando ? "Entrando…" : "Entrar"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-hc-navy-soft underline-offset-2 transition-colors hover:text-hc-cyan hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Defina sua senha</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Primeiro acesso: crie uma nova senha (mín. 6 caracteres) para continuar.
              </p>
              <form onSubmit={salvarNovaSenha} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">Nova senha</label>
                  <CampoSenha
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Nova senha"
                    autoComplete="new-password"
                    autoFocus
                    tone="escuro"
                    className={campoCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">Confirmar nova senha</label>
                  <CampoSenha
                    value={confSenha}
                    onChange={(e) => setConfSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    tone="escuro"
                    className={campoCls}
                  />
                </div>
                {erro && <p className="text-sm text-[#FF9BA3]">{erro}</p>}
                <button type="submit" disabled={carregando} className="hcx-btn-cy w-full">
                  {carregando ? "Salvando…" : "Salvar e entrar"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-hc-navy-soft">
          🔒 Autenticação com dois fatores (MFA) será habilitada para colaboradores.
        </p>
      </main>

      <RodapeEscuro />
    </>
  );
}
