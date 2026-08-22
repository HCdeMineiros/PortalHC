"use client";

import { useCallback, useEffect, useState } from "react";

const brl = (c: number | null | undefined) =>
  ((c ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dataHora = (s: string | null) => (s ? new Date(s).toLocaleString("pt-BR") : "—");

function rotuloTipo(tipo: string) {
  if (tipo === "diferenca_acomodacao") return "Diferença de acomodação";
  if (tipo === "internacao_clinica") return "Internação clínica";
  return "Cirurgia";
}

interface Item {
  id: string;
  numero: string;
  tipo: string;
  status: string;
  procedimento_nome: string | null;
  valor_total_centavos: number | null;
  acomodacao_total_centavos: number | null;
  finalizada_em: string | null;
  componentes_centavos: { finalizadaPorNome?: string; plano?: string; medicoNome?: string } | null;
  pacientes: { nome: string; ref_externa_promedico: string | null } | null;
  medicos: { nome: string } | null;
}

async function token() {
  const { criarClienteBrowser } = await import("@/lib/supabase/client");
  const { data } = await criarClienteBrowser().auth.getSession();
  return data.session?.access_token;
}

export function PainelFaturamento() {
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const t = await token();
      const resp = await fetch("/api/colaborador/cirurgias", { headers: { Authorization: `Bearer ${t}` } });
      const json = await resp.json();
      if (!resp.ok) {
        setErro(json?.erro || "Falha ao carregar.");
        return;
      }
      const todas: Item[] = json.cirurgias ?? [];
      const encerradas = todas
        .filter((c) => c.status === "encerrada")
        .sort((a, b) => (b.finalizada_em ?? "").localeCompare(a.finalizada_em ?? ""));
      setItens(encerradas);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = itens.filter((c) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.numero ?? "").toLowerCase().includes(q) ||
      (c.procedimento_nome ?? "").toLowerCase().includes(q) ||
      (c.pacientes?.nome ?? "").toLowerCase().includes(q) ||
      (c.pacientes?.ref_externa_promedico ?? "").toLowerCase().includes(q) ||
      (c.componentes_centavos?.finalizadaPorNome ?? "").toLowerCase().includes(q)
    );
  });

  const somaTotal = filtradas.reduce(
    (acc, c) => acc + (c.valor_total_centavos ?? 0) + (c.acomodacao_total_centavos ?? 0),
    0,
  );

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Faturamento — finalizados e baixados</h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            {filtradas.length} {filtradas.length === 1 ? "registro" : "registros"} · total {brl(somaTotal)}
          </p>
        </div>
        <button onClick={carregar} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">Atualizar</button>
      </div>

      <div className="relative mt-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por paciente, ficha, número ou responsável…"
          className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 pl-11 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hc-ink-soft)]">🔎</span>
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}

      {carregando ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
      ) : filtradas.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Nenhum atendimento finalizado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtradas.map((c) => {
            const totalGeral = (c.valor_total_centavos ?? 0) + (c.acomodacao_total_centavos ?? 0);
            const responsavel = c.componentes_centavos?.finalizadaPorNome || "—";
            return (
              <li key={c.id} className="hc-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
                        {c.procedimento_nome || rotuloTipo(c.tipo)}
                      </h3>
                      <span className="hc-badge">{rotuloTipo(c.tipo)}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        ✓ Baixado
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                      {c.pacientes?.nome} · Ficha {c.pacientes?.ref_externa_promedico || "—"} · Sol. {c.numero}
                      {c.medicos?.nome ? ` · ${c.medicos.nome}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                      Baixa/finalização por <strong className="text-[var(--hc-ink)]">{responsavel}</strong> em {dataHora(c.finalizada_em)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Total</p>
                    <p className="font-serif text-xl font-semibold text-[var(--hc-red-600)]">{brl(totalGeral)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
