"use client";

import { useState } from "react";
import { CampoSenha } from "@/components/brand/CampoSenha";

interface Criado {
  nome: string;
  email: string;
  papel: string;
}

const PAPEIS: { valor: string; rotulo: string }[] = [
  { valor: "medico", rotulo: "Médico" },
  { valor: "internacao", rotulo: "Internação" },
  { valor: "faturamento", rotulo: "Faturamento" },
  { valor: "cobranca", rotulo: "Cobrança" },
  { valor: "administrativo", rotulo: "Administrativo" },
  { valor: "limpeza", rotulo: "Manutenção de limpeza" },
  { valor: "admin_dpo", rotulo: "Administrador" },
];

function gerarSenhaProvisoria() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function CriarUsuario({ onCriado }: { onCriado?: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("medico");
  const [senha, setSenha] = useState(gerarSenhaProvisoria); // provisória, já preenchida
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [criados, setCriados] = useState<Criado[]>([]);

  function gerarSenha() {
    setSenha(gerarSenhaProvisoria());
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");
    setEnviando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setErro("Sessão expirada. Faça login novamente.");
        return;
      }
      const resp = await fetch("/api/admin/criar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, email, papel, senha }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setErro(json?.erro || "Falha ao criar usuário.");
        return;
      }
      const rotulo = PAPEIS.find((p) => p.valor === papel)?.rotulo || papel;
      setCriados((prev) => [{ nome, email, papel: rotulo }, ...prev]);
      setOk(`Usuário criado! Senha provisória: ${senha} — entregue a ${nome}. Ele troca no primeiro acesso.`);
      setNome("");
      setEmail("");
      setSenha(gerarSenhaProvisoria());
      setPapel("medico");
      onCriado?.();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]";

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Administração</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">
        Cadastrar médico ou colaborador
      </h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Uma senha provisória é gerada automaticamente. Entregue-a à pessoa — no primeiro acesso
        ela será obrigada a criar a própria senha.
      </p>

      <form onSubmit={enviar} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Nome completo</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Ex.: Dr. João Ribeiro" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">E-mail (login)</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="pessoa@portalhc.com.br" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Papel</span>
          <select value={papel} onChange={(e) => setPapel(e.target.value)} className={inputCls}>
            {PAPEIS.map((p) => (
              <option key={p.valor} value={p.valor}>{p.rotulo}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Senha provisória</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <CampoSenha defaultVisivel value={senha} onChange={(e) => setSenha(e.target.value)} className={inputCls} placeholder="mín. 6 caracteres" autoComplete="new-password" />
            </div>
            <button type="button" onClick={gerarSenha} className="hc-btn hc-btn-ghost flex-none px-3 py-2 text-xs">
              Gerar
            </button>
          </div>
        </label>

        <div className="sm:col-span-2">
          {erro && <p className="mb-2 text-sm text-[var(--hc-red-600)]">{erro}</p>}
          {ok && <p className="mb-2 text-sm text-emerald-600">{ok}</p>}
          <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary w-full sm:w-auto">
            {enviando ? "Criando…" : "Criar acesso"}
          </button>
        </div>
      </form>

      {criados.length > 0 && (
        <div className="mt-8 border-t border-[var(--hc-line)] pt-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
            Criados nesta sessão ({criados.length})
          </h3>
          <ul className="mt-3 space-y-2">
            {criados.map((c, i) => (
              <li key={i} className="hc-card flex items-center justify-between gap-3 p-3 text-sm">
                <span className="text-[var(--hc-ink)]">{c.nome} · {c.email}</span>
                <span className="hc-badge">{c.papel}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--hc-ink-soft)]">
            Anote e entregue a senha à pessoa por um canal seguro. Ela pode trocá-la depois.
          </p>
        </div>
      )}
    </div>
  );
}
