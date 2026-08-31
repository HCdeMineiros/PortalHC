"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { CampoSenha } from "@/components/brand/CampoSenha";
import { InatividadeLogout } from "@/components/brand/InatividadeLogout";

type Fase = "checando" | "senha" | "ok" | "negado";

/**
 * Protege /admin: exige sessão + papel admin_dpo E confirmação da senha
 * (dupla conferência para a área sensível de administração).
 */
export function GuardaAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [fase, setFase] = useState<Fase>(SUPABASE_CONFIGURADO ? "checando" : "ok");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data: s } = await supabase.auth.getSession();
      if (!ativo) return;
      if (!s.session) {
        router.replace(`/medico/login?redir=${encodeURIComponent(pathname)}`);
        return;
      }
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("papel")
        .eq("id", s.session.user.id)
        .single();
      if (!ativo) return;
      if (perfil?.papel === "admin_dpo") {
        setEmail(s.session.user.email ?? "");
        setFase("senha");
      } else {
        setFase("negado");
      }
    })();
    return () => {
      ativo = false;
    };
  }, [router, pathname]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setVerificando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setErro("Senha incorreta.");
      else setFase("ok");
    } catch {
      setErro("Erro ao confirmar. Tente novamente.");
    } finally {
      setVerificando(false);
    }
  }

  if (fase === "ok") return (<><InatividadeLogout />{children}</>);

  if (fase === "negado") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--hc-red-050)] text-2xl">🔒</div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Acesso restrito</h1>
        <p className="text-sm text-[var(--hc-ink-soft)]">
          Esta área é exclusiva da Administração/DPO. Sua conta não tem essa permissão.
        </p>
        <Link href="/colaborador" className="hc-btn hc-btn-ghost">← Voltar</Link>
      </div>
    );
  }

  if (fase === "senha") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-6">
        <div className="hc-card hc-gold-frame hc-fade-up p-8">
          <span className="hc-badge">Administração · dupla conferência</span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--hc-ink)]">Confirme sua senha</h1>
          <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
            Área sensível. Digite sua senha novamente para acessar a Administração.
          </p>
          <form onSubmit={confirmar} className="mt-6 space-y-4">
            <input value={email} readOnly className="w-full rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] px-4 py-3 text-[var(--hc-ink-soft)]" />
            <CampoSenha
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
            />
            {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
            <button type="submit" disabled={verificando} className="hc-btn hc-btn-primary w-full">
              {verificando ? "Confirmando…" : "Acessar Administração"}
            </button>
            <Link href="/colaborador" className="block text-center text-sm text-[var(--hc-ink-soft)] hover:text-[var(--hc-red-600)]">
              ← Voltar
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hc-line)] border-t-[var(--hc-red-600)]" />
      <p className="text-sm text-[var(--hc-ink-soft)]">Verificando acesso…</p>
    </div>
  );
}
