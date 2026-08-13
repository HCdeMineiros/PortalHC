"use client";

import { useCallback, useEffect, useState } from "react";

interface Usuario {
  id: string;
  nome: string;
  email: string | null;
  papel: string;
  ativo: boolean;
}

const ROTULO_PAPEL: Record<string, string> = {
  admin_dpo: "Administrador / DPO",
  medico: "Médico",
  internacao: "Internação",
  faturamento: "Faturamento",
  enfermagem: "Enfermagem",
  paciente: "Paciente",
};

export function ListaUsuarios({ refreshKey }: { refreshKey: number }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data, error } = await criarClienteBrowser()
        .from("usuarios")
        .select("id, nome, email, papel, ativo")
        .order("nome");
      if (error) setErro(error.message);
      else setUsuarios(data ?? []);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar, refreshKey]);

  async function excluir(u: Usuario) {
    if (!confirm(`Excluir o acesso de ${u.nome} (${u.email})?\nEssa pessoa não poderá mais entrar.`)) return;
    setExcluindo(u.id);
    setErro("");
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      const resp = await fetch("/api/admin/excluir-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: u.id }),
      });
      const json = await resp.json();
      if (!resp.ok) setErro(json?.erro || "Falha ao excluir.");
      else setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setExcluindo(null);
    }
  }

  const filtrados = usuarios.filter((u) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (
      u.nome.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (ROTULO_PAPEL[u.papel] ?? u.papel).toLowerCase().includes(q)
    );
  });

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">
            Equipe com acesso
          </h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            {usuarios.length} {usuarios.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
          </p>
        </div>
        <button onClick={carregar} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
          Atualizar
        </button>
      </div>

      <div className="relative mt-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou papel…"
          className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 pl-11 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hc-ink-soft)]">🔎</span>
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}

      {carregando ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
      ) : (
        <ul className="hc-scroll mt-4 max-h-[30rem] divide-y divide-[var(--hc-line)] overflow-y-auto">
          {filtrados.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-[var(--hc-ink)]">{u.nome}</p>
                <p className="text-sm text-[var(--hc-ink-soft)]">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hc-badge">{ROTULO_PAPEL[u.papel] ?? u.papel}</span>
                <button
                  onClick={() => excluir(u)}
                  disabled={excluindo === u.id}
                  className="rounded-full border border-[var(--hc-line)] px-3 py-1.5 text-sm text-[var(--hc-red-600)] transition-colors hover:border-[var(--hc-red-600)] hover:bg-[var(--hc-red-050)] disabled:opacity-50"
                >
                  {excluindo === u.id ? "Excluindo…" : "Excluir"}
                </button>
              </div>
            </li>
          ))}
          {filtrados.length === 0 && (
            <li className="py-6 text-center text-sm text-[var(--hc-ink-soft)]">Nenhum usuário encontrado.</li>
          )}
        </ul>
      )}
    </div>
  );
}
