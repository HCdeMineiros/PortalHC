"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HOSPITAL } from "@/lib/brand";
import { Comprovantes } from "./Comprovantes";

const brl = (c: number | null | undefined) =>
  ((c ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dataHora = (s: string | null) => (s ? new Date(s).toLocaleString("pt-BR") : "—");

/** Data local (YYYY-MM-DD) de um timestamp ISO. */
function ymdLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function hojeYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function ymdParaBr(ymd: string): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m] as string);

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
  const [dataFiltro, setDataFiltro] = useState<string>(hojeYmd()); // "" = todos

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

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((c) => {
      if (dataFiltro && ymdLocal(c.finalizada_em) !== dataFiltro) return false;
      if (!q) return true;
      return (
        (c.numero ?? "").toLowerCase().includes(q) ||
        (c.procedimento_nome ?? "").toLowerCase().includes(q) ||
        (c.pacientes?.nome ?? "").toLowerCase().includes(q) ||
        (c.pacientes?.ref_externa_promedico ?? "").toLowerCase().includes(q) ||
        (c.componentes_centavos?.finalizadaPorNome ?? "").toLowerCase().includes(q)
      );
    });
  }, [itens, busca, dataFiltro]);

  const somaTotal = filtradas.reduce(
    (acc, c) => acc + (c.valor_total_centavos ?? 0) + (c.acomodacao_total_centavos ?? 0),
    0,
  );

  const rotuloPeriodo = dataFiltro ? ymdParaBr(dataFiltro) : "Todos os registros";

  function imprimir() {
    const linhas = filtradas
      .map((c) => {
        const total = (c.valor_total_centavos ?? 0) + (c.acomodacao_total_centavos ?? 0);
        const resp = c.componentes_centavos?.finalizadaPorNome || "—";
        return `<tr>
          <td>${esc(dataHora(c.finalizada_em))}</td>
          <td>${esc(c.pacientes?.nome ?? "—")}<br><span class="s">${esc(rotuloTipo(c.tipo))} · Sol. ${esc(c.numero)}</span></td>
          <td>${esc(resp)}</td>
          <td class="v">${brl(total)}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Faturamento — ${esc(rotuloPeriodo)}</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;color:#1A1616;margin:28px;}
  .top{border-bottom:2px solid #C9A227;padding-bottom:12px;}
  .hosp{font-size:18px;font-weight:bold;} .sub{font-size:12px;color:#4B4444;}
  h1{font-size:20px;margin:18px 0 2px;} .meta{font-size:12px;color:#4B4444;margin-bottom:14px;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th,td{padding:7px 8px;border-bottom:1px solid #E7DFD5;text-align:left;vertical-align:top;}
  th{background:#F3EEE7;font-size:11px;text-transform:uppercase;letter-spacing:.04em;}
  td.v,th.v{text-align:right;font-variant-numeric:tabular-nums;}
  .s{color:#4B4444;font-size:11px;}
  .total{display:flex;justify-content:space-between;margin-top:14px;font-size:16px;font-weight:bold;border-top:2px solid #C9A227;padding-top:10px;}
  .total .g{color:#C8102E;font-size:20px;}
  .rodape{margin-top:20px;font-size:11px;color:#4B4444;text-align:center;}
  @media print{body{margin:12mm;}}
</style></head><body>
  <div class="top"><div class="hosp">${esc(HOSPITAL.nome)}</div>
  <div class="sub">${esc(HOSPITAL.endereco)} · ${esc(HOSPITAL.cidade)} · ${esc(HOSPITAL.telefones.join(" · "))}</div></div>
  <h1>Faturamento — finalizados e baixados</h1>
  <div class="meta">Período: <b>${esc(rotuloPeriodo)}</b> · ${filtradas.length} registro(s) · Emitido em ${esc(new Date().toLocaleString("pt-BR"))}</div>
  <table>
    <thead><tr><th>Baixa (data/hora)</th><th>Paciente / atendimento</th><th>Responsável</th><th class="v">Total</th></tr></thead>
    <tbody>${linhas || `<tr><td colspan="4">Nenhum registro no período.</td></tr>`}</tbody>
  </table>
  <div class="total"><span>Total do período</span><span class="g">${brl(somaTotal)}</span></div>
  <div class="rodape">${esc(HOSPITAL.nomeCurto)} · ${esc(HOSPITAL.dominio)}</div>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=920");
    if (!w) {
      alert("Não foi possível abrir a janela de impressão. Habilite os pop-ups para este site.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Faturamento — finalizados e baixados</h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            Período: <strong>{rotuloPeriodo}</strong> · {filtradas.length} {filtradas.length === 1 ? "registro" : "registros"} · total {brl(somaTotal)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">Atualizar</button>
          <button onClick={imprimir} disabled={filtradas.length === 0} className="hc-btn hc-btn-primary px-4 py-2 text-sm disabled:opacity-50">
            🖨 Imprimir
          </button>
        </div>
      </div>

      {/* Filtro de data */}
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-3">
        <button
          onClick={() => setDataFiltro(hojeYmd())}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            dataFiltro === hojeYmd()
              ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
              : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
          }`}
        >
          Diário (hoje)
        </button>
        <label className="block">
          <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Data específica</span>
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]"
          />
        </label>
        <button
          onClick={() => setDataFiltro("")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            dataFiltro === ""
              ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
              : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
          }`}
        >
          Todos
        </button>
      </div>

      <div className="relative mt-4">
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
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Nenhum atendimento finalizado no período.</p>
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
                <Comprovantes solicitacaoId={c.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
