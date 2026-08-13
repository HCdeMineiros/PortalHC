"use client";

import { useCallback, useEffect, useState } from "react";
import { ACOMODACOES, TAXA_FIXA_CIRURGICA_CENTAVOS } from "@/lib/data/acomodacoes";

const brl = (c: number | null | undefined) =>
  ((c ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_ROTULO: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_paciente: "Aguardando paciente",
  documentos_pendentes: "Documentos pendentes",
  termos_assinados: "Termos assinados",
  liberada_para_admissao: "Liberada p/ admissão",
  realizada: "Realizada",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
};

interface Cirurgia {
  id: string;
  numero: string;
  tipo: string;
  status: string;
  procedimento_nome: string | null;
  valor_total_centavos: number | null;
  data_prevista: string | null;
  acomodacao: string | null;
  acomodacao_dias: number | null;
  acomodacao_total_centavos: number | null;
  finalizada_em: string | null;
  docs_total: number;
  docs_ok: number;
  pacientes: { nome: string; cpf: string; ref_externa_promedico: string | null; telefone_whatsapp: string | null } | null;
  medicos: { nome: string } | null;
}

const nomeAcom = (chave: string | null) => ACOMODACOES.find((a) => a.chave === chave)?.nome ?? "—";

/** Selo do progresso de assinatura dos documentos pelo paciente. */
function StatusDocumentos({ ok, total }: { ok: number; total: number }) {
  if (total === 0) return null;
  const completo = ok >= total;
  const cls = completo
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : ok > 0
      ? "border-[var(--hc-gold)]/50 bg-[color-mix(in_srgb,var(--hc-gold)_12%,white)] text-[var(--hc-gold-deep)]"
      : "border-[var(--hc-red-600)]/40 bg-[var(--hc-red-050)] text-[var(--hc-red-600)]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {completo ? "✓ Documentos assinados" : "Documentos pendentes"} ({ok}/{total})
    </span>
  );
}

export function ListaCirurgias() {
  const [cirurgias, setCirurgias] = useState<Cirurgia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  async function token() {
    const { criarClienteBrowser } = await import("@/lib/supabase/client");
    const { data } = await criarClienteBrowser().auth.getSession();
    return data.session?.access_token;
  }

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const t = await token();
      const resp = await fetch("/api/colaborador/cirurgias", { headers: { Authorization: `Bearer ${t}` } });
      const json = await resp.json();
      if (!resp.ok) setErro(json?.erro || "Falha ao carregar.");
      else setCirurgias(json.cirurgias ?? []);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function atualizar(id: string, body: Record<string, unknown>) {
    const t = await token();
    const resp = await fetch("/api/colaborador/cirurgias", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ id, ...body }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.erro || "Falha ao atualizar.");
    return json;
  }

  const filtradas = cirurgias.filter((c) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.numero ?? "").toLowerCase().includes(q) ||
      (c.procedimento_nome ?? "").toLowerCase().includes(q) ||
      (c.pacientes?.nome ?? "").toLowerCase().includes(q) ||
      (c.pacientes?.ref_externa_promedico ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Cirurgias cadastradas</h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            {cirurgias.length} {cirurgias.length === 1 ? "lançamento" : "lançamentos"}
          </p>
        </div>
        <button onClick={carregar} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">Atualizar</button>
      </div>

      <div className="relative mt-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por paciente, ficha, número ou cirurgia…"
          className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 pl-11 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hc-ink-soft)]">🔎</span>
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}

      {carregando ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
      ) : filtradas.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Nenhuma cirurgia encontrada.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {filtradas.map((c) => (
            <CardCirurgia key={c.id} c={c} atualizar={atualizar} onMudou={carregar} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CardCirurgia({
  c,
  atualizar,
  onMudou,
}: {
  c: Cirurgia;
  atualizar: (id: string, body: Record<string, unknown>) => Promise<{ acomodacao_total_centavos?: number }>;
  onMudou: () => void;
}) {
  const [acom, setAcom] = useState(c.acomodacao ?? "");
  const [dias, setDias] = useState(c.acomodacao_dias ? String(c.acomodacao_dias) : "1");
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const encerrada = c.status === "encerrada";
  const ehInternacao = c.tipo === "internacao_clinica";
  const acomTotal = c.acomodacao_total_centavos ?? 0;
  const totalGeral = (c.valor_total_centavos ?? 0) + acomTotal;

  async function lancarAcomodacao() {
    if (!acom) return setMsg("Escolha a acomodação.");
    setOcupado(true);
    setMsg("");
    try {
      await atualizar(c.id, { acao: "acomodacao", acomodacao: acom, dias: Number(dias) });
      onMudou();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha.");
    } finally {
      setOcupado(false);
    }
  }

  async function finalizar() {
    if (!confirm(`Finalizar o atendimento da solicitação ${c.numero}?`)) return;
    setOcupado(true);
    setMsg("");
    try {
      await atualizar(c.id, { acao: "finalizar" });
      onMudou();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <li className={`hc-card p-5 ${encerrada ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
              {c.procedimento_nome || "Cirurgia"}
            </h3>
            <span className="hc-badge">{STATUS_ROTULO[c.status] ?? c.status}</span>
            <StatusDocumentos ok={c.docs_ok} total={c.docs_total} />
          </div>
          <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
            {c.pacientes?.nome} · Ficha {c.pacientes?.ref_externa_promedico || "—"} · Sol. {c.numero}
            {c.medicos?.nome ? ` · ${c.medicos.nome}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Cirurgia</p>
          <p className="font-semibold text-[var(--hc-ink)]">{brl(c.valor_total_centavos)}</p>
        </div>
      </div>

      {/* Acomodação */}
      <div className="mt-4 rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Acomodação</p>

        {ehInternacao ? (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <span className="block text-xs text-[var(--hc-ink-soft)]">Definida pelo médico</span>
              <span className="font-medium text-[var(--hc-ink)]">{nomeAcom(c.acomodacao)} · {brl(ACOMODACOES.find((a) => a.chave === c.acomodacao)?.totalDiaCentavos ?? 0)}/dia</span>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Diárias</span>
              <input type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} disabled={encerrada}
                className="w-20 rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]" />
            </label>
            <button onClick={lancarAcomodacao} disabled={ocupado || encerrada} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
              {c.acomodacao_dias ? "Atualizar diárias" : "Lançar diárias"}
            </button>
            {(c.acomodacao_dias ?? 0) > 0 && (
              <span className="text-sm text-[var(--hc-ink-soft)]">
                {c.acomodacao_dias}× diária = <strong className="text-[var(--hc-ink)]">{brl(acomTotal)}</strong>
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Tipo</span>
              <select value={acom} onChange={(e) => setAcom(e.target.value)} disabled={encerrada}
                className="rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]">
                <option value="">Selecionar…</option>
                {ACOMODACOES.map((a) => (
                  <option key={a.chave} value={a.chave}>{a.nome} ({brl(a.totalDiaCentavos)}/dia)</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Diárias</span>
              <input type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} disabled={encerrada}
                className="w-20 rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]" />
            </label>
            <button onClick={lancarAcomodacao} disabled={ocupado || encerrada} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
              {c.acomodacao ? "Atualizar" : "Lançar"}
            </button>
            {c.acomodacao && (
              <span className="text-sm text-[var(--hc-ink-soft)]">
                Taxa fixa {brl(TAXA_FIXA_CIRURGICA_CENTAVOS)} + {c.acomodacao_dias}× diária ={" "}
                <strong className="text-[var(--hc-ink)]">{brl(acomTotal)}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Total geral + finalizar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm text-[var(--hc-ink-soft)]">Total geral: </span>
          <span className="font-serif text-xl font-semibold text-[var(--hc-red-600)]">{brl(totalGeral)}</span>
        </div>
        {encerrada ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">✓ Atendimento finalizado</span>
        ) : (
          <button onClick={finalizar} disabled={ocupado} className="hc-btn hc-btn-primary px-6 py-2.5">
            Finalizar atendimento
          </button>
        )}
      </div>
      {msg && <p className="mt-2 text-sm text-[var(--hc-red-600)]">{msg}</p>}
    </li>
  );
}
