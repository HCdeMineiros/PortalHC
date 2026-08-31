"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { CampoSenha } from "@/components/brand/CampoSenha";

/**
 * Menu do usuário logado no topo: mostra quem está conectado (nome, e-mail e
 * papel) e oferece "Alterar senha" e "Sair". A alteração de senha confirma a
 * senha atual antes de aplicar a nova.
 */
const PAPEL_ROTULO: Record<string, string> = {
  admin_dpo: "Administrador / DPO",
  medico: "Médico",
  internacao: "Internação",
  faturamento: "Faturamento",
};

export function BotaoSair() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState("");
  const [aberto, setAberto] = useState(false);
  const [trocando, setTrocando] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data } = await supabase.auth.getUser();
      if (!ativo || !data.user) return;
      setEmail(data.user.email ?? null);
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nome, papel")
        .eq("id", data.user.id)
        .single();
      if (!ativo) return;
      setNome(perfil?.nome ?? "");
      setPapel(perfil?.papel ?? "");
    })();
    return () => {
      ativo = false;
    };
  }, []);

  // fecha o menu ao clicar fora
  useEffect(() => {
    function fora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAberto(false);
        setTrocando(false);
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  if (!email) return null;

  async function sair() {
    const { criarClienteBrowser } = await import("@/lib/supabase/client");
    await criarClienteBrowser().auth.signOut();
    router.push("/medico/login");
  }

  const rotuloPapel = PAPEL_ROTULO[papel] ?? "Usuário";
  const exibicao = nome || email;
  const inicial = (nome || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex items-center gap-2.5 rounded-full border border-[var(--hc-line)] bg-white py-1.5 pl-1.5 pr-3 text-left transition-colors hover:border-[var(--hc-gold)]"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-b from-[var(--hc-gold)] to-[var(--hc-gold-deep)] font-serif text-sm font-bold text-white">
          {inicial}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block max-w-[12rem] truncate text-sm font-semibold text-[var(--hc-ink)]">{exibicao}</span>
          <span className="block text-[11px] text-[var(--hc-ink-soft)]">{rotuloPapel}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--hc-ink-soft)]" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--hc-line)] bg-white shadow-[0_24px_60px_-24px_rgba(26,22,22,.45)]"
        >
          {/* Cabeçalho: quem está logado */}
          <div className="flex items-center gap-3 border-b border-[var(--hc-line)] bg-[var(--hc-cream)] p-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-b from-[var(--hc-gold)] to-[var(--hc-gold-deep)] font-serif text-lg font-bold text-white">
              {inicial}
            </span>
            <div className="min-w-0">
              {nome && <p className="truncate font-semibold text-[var(--hc-ink)]">{nome}</p>}
              <p className="truncate text-sm text-[var(--hc-ink-soft)]">{email}</p>
              <span className="mt-1 inline-flex rounded-full border border-[var(--hc-gold)]/40 bg-[color-mix(in_srgb,var(--hc-gold)_10%,white)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--hc-gold-deep)]">
                {rotuloPapel}
              </span>
            </div>
          </div>

          {!trocando ? (
            <div className="p-2">
              <button
                onClick={() => setTrocando(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--hc-ink)] hover:bg-[var(--hc-cream-2)]"
              >
                <span aria-hidden>🔑</span> Alterar senha
              </button>
              <button
                onClick={sair}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--hc-red-600)] hover:bg-[var(--hc-red-050)]"
              >
                <span aria-hidden>↩</span> Sair
              </button>
            </div>
          ) : (
            <FormularioTrocarSenha email={email} onFechar={() => setTrocando(false)} />
          )}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]";

function FormularioTrocarSenha({ email, onFechar }: { email: string; onFechar: () => void }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [conf, setConf] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setOk(false);
    if (!atual) return setMsg("Informe a senha atual.");
    if (nova.length < 6) return setMsg("A nova senha deve ter ao menos 6 caracteres.");
    if (nova !== conf) return setMsg("A confirmação da nova senha não confere.");

    setEnviando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      // confirma a senha atual antes de alterar
      const { error: e1 } = await supabase.auth.signInWithPassword({ email, password: atual });
      if (e1) {
        setMsg("Senha atual incorreta.");
        return;
      }
      const { error: e2 } = await supabase.auth.updateUser({ password: nova });
      if (e2) {
        setMsg(e2.message || "Não foi possível alterar a senha.");
        return;
      }
      setOk(true);
      setMsg("Senha alterada com sucesso.");
      setAtual("");
      setNova("");
      setConf("");
    } catch {
      setMsg("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-3 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Alterar senha</p>
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Senha atual</span>
        <CampoSenha value={atual} onChange={(e) => setAtual(e.target.value)} className={inputCls} autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Nova senha</span>
        <CampoSenha value={nova} onChange={(e) => setNova(e.target.value)} className={inputCls} autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Confirmar nova senha</span>
        <CampoSenha value={conf} onChange={(e) => setConf(e.target.value)} className={inputCls} autoComplete="new-password" />
      </label>

      {msg && (
        <p className={`text-sm ${ok ? "text-emerald-600" : "text-[var(--hc-red-600)]"}`}>{msg}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary flex-1 py-2 text-sm">
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" onClick={onFechar} disabled={enviando} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
          {ok ? "Fechar" : "Cancelar"}
        </button>
      </div>
    </form>
  );
}
