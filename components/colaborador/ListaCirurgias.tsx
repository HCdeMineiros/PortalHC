"use client";

import { useCallback, useEffect, useState } from "react";
import { ACOMODACOES, TAXA_FIXA_CIRURGICA_CENTAVOS, difAcomInfo, DIFERENCA_ACOMODACAO } from "@/lib/data/acomodacoes";
import { FormularioEdicaoSolicitacao, podeEditar, MINUTOS_EDICAO } from "@/components/medico/FormularioEdicaoSolicitacao";
import { HOSPITAL } from "@/lib/brand";
import { BotaoWhatsapp } from "@/components/brand/BotaoWhatsapp";

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
  componentes_centavos:
    | { cirurgiao?: number; medico?: number; anestesista?: number; auxiliar?: number; hospital?: number; plano?: string; medicoNome?: string; tratamento?: string }
    | null;
  valor_total_centavos: number | null;
  codigo_acesso: string | null;
  data_prevista: string | null;
  acomodacao: string | null;
  acomodacao_dias: number | null;
  acomodacao_total_centavos: number | null;
  finalizada_em: string | null;
  criado_em: string;
  docs_total: number;
  docs_ok: number;
  pacientes: { nome: string; cpf: string | null; data_nascimento: string | null; ref_externa_promedico: string | null; telefone_whatsapp: string | null } | null;
  medicos: { nome: string } | null;
}

const nomeAcom = (chave: string | null) => ACOMODACOES.find((a) => a.chave === chave)?.nome ?? "—";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m] as string);
const maskCpf = (v: string | null) => {
  const d = (v ?? "").replace(/\D/g, "").slice(0, 11);
  return d ? d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2") : "—";
};

/** Abre uma janela com o documento da diferença de acomodação e chama a impressão. */
function imprimirDiferenca(c: Cirurgia) {
  const comp = c.componentes_centavos ?? {};
  const criado = c.criado_em ? new Date(c.criado_em).toLocaleString("pt-BR") : "";
  const totalGeral = (c.valor_total_centavos ?? 0) + (c.acomodacao_total_centavos ?? 0);
  const difAcom = c.acomodacao ? difAcomInfo(comp.tratamento ?? "cirurgico", c.acomodacao) : undefined;
  const linhaItem = (rot: string, val: number) =>
    `<tr><td>${rot}</td><td class="v">${brl(val)}</td></tr>`;
  const linhaOpc = (rot: string, val: number) => (val > 0 ? linhaItem(rot, val) : "");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Diferença de acomodação — ${esc(c.numero)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1A1616; margin: 32px; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #C9A227; padding-bottom:12px; }
  .hosp { font-size: 18px; font-weight: bold; }
  .sub { font-size: 12px; color:#4B4444; }
  h1 { font-size: 20px; margin: 20px 0 4px; }
  .meta { font-size: 12px; color:#4B4444; margin-bottom: 16px; }
  .box { border:1px solid #E7DFD5; border-radius:8px; padding:12px 16px; margin-bottom:14px; }
  .box h2 { font-size: 12px; text-transform:uppercase; letter-spacing:.06em; color:#9A7B12; margin:0 0 8px; }
  .row { font-size: 14px; margin: 3px 0; }
  table { width:100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 6px 0; border-bottom: 1px dashed #E7DFD5; }
  td.v { text-align: right; font-variant-numeric: tabular-nums; }
  .total { display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:16px; font-weight:bold; }
  .total .g { color:#C8102E; font-size:20px; }
  .assin { margin-top:48px; display:flex; gap:48px; }
  .assin div { flex:1; border-top:1px solid #1A1616; padding-top:6px; font-size:12px; text-align:center; color:#4B4444; }
  .rodape { margin-top:28px; font-size:11px; color:#4B4444; text-align:center; }
  @media print { body { margin: 16mm; } }
</style></head><body>
  <div class="top">
    <div>
      <div class="hosp">${esc(HOSPITAL.nome)}</div>
      <div class="sub">${esc(HOSPITAL.endereco)} · ${esc(HOSPITAL.cidade)} · ${esc(HOSPITAL.telefones.join(" · "))}</div>
    </div>
  </div>

  <h1>Diferença de Acomodação</h1>
  <div class="meta">Nº da solicitação: <b>${esc(c.numero)}</b>${criado ? ` · Emitido em ${esc(criado)}` : ""}</div>

  <div class="box">
    <h2>Paciente</h2>
    <div class="row"><b>${esc(c.pacientes?.nome ?? "—")}</b></div>
    <div class="row">CPF: ${maskCpf(c.pacientes?.cpf ?? "")} · Ficha (PROMÉDICO): ${esc(c.pacientes?.ref_externa_promedico ?? "—")}</div>
    <div class="row">Plano de saúde: <b>${esc(comp.plano ?? "—")}</b></div>
    <div class="row">Médico cirurgião: <b>${esc(comp.medicoNome ?? "—")}</b></div>
  </div>

  <div class="box">
    <h2>Composição da diferença</h2>
    <table>
      ${linhaOpc("Honorário médico", comp.medico ?? 0)}
      ${linhaOpc("Honorário do anestesista", comp.anestesista ?? 0)}
      ${linhaOpc("Honorário do médico auxiliar", comp.auxiliar ?? 0)}
      ${linhaOpc("Taxa de sala · hospital", comp.hospital ?? 0)}
      ${
        c.acomodacao
          ? linhaItem(
              `Acomodação — ${difAcom?.nome ?? c.acomodacao} (${c.acomodacao_dias}× diária${(difAcom?.taxaFixaCentavos ?? 0) > 0 ? " + taxa fixa" : ""})`,
              c.acomodacao_total_centavos ?? 0,
            )
          : ""
      }
    </table>
    <div class="total"><span>Total da diferença</span><span class="g">${brl(totalGeral)}</span></div>
  </div>

  <div class="assin">
    <div>Responsável pelo lançamento</div>
    <div>Paciente / responsável</div>
  </div>

  <div class="rodape">Documento para lançamento — anexar ao prontuário. ${esc(HOSPITAL.nomeCurto)} · ${esc(HOSPITAL.dominio)}</div>
</body></html>`;

  const w = window.open("", "_blank", "width=820,height=920");
  if (!w) {
    alert("Não foi possível abrir a janela de impressão. Habilite os pop-ups para este site.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

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
  const [papel, setPapel] = useState("");
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
      else {
        setCirurgias(json.cirurgias ?? []);
        setPapel(json.papel ?? "");
      }
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

  // encerrados/baixados saem da Internação e passam a viver na aba Faturamento
  const ativas = cirurgias.filter((c) => c.status !== "encerrada");
  const filtradas = ativas.filter((c) => {
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
            {ativas.length} {ativas.length === 1 ? "em aberto" : "em aberto"} · finalizados vão para Faturamento
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
            <CardCirurgia key={c.id} c={c} atualizar={atualizar} onMudou={carregar} papel={papel} />
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
  papel,
}: {
  c: Cirurgia;
  atualizar: (id: string, body: Record<string, unknown>) => Promise<{ acomodacao_total_centavos?: number }>;
  onMudou: () => void;
  papel: string;
}) {
  const [acom, setAcom] = useState(c.acomodacao ?? "");
  const [dias, setDias] = useState(c.acomodacao_dias ? String(c.acomodacao_dias) : "1");
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [editando, setEditando] = useState(false);
  const editavel = c.status !== "encerrada" && podeEditar(c.criado_em, papel, c.tipo);

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

  async function darBaixa() {
    if (!confirm(`Registrar o RECEBIMENTO da diferença de acomodação (Sol. ${c.numero})?`)) return;
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

  // Card específico da diferença de acomodação (lançamento financeiro)
  if (c.tipo === "diferenca_acomodacao") {
    const comp = c.componentes_centavos ?? {};
    const linha = (rotulo: string, valor: number) => (
      <div className="flex items-center justify-between py-1">
        <span className="text-[var(--hc-ink-soft)]">{rotulo}</span>
        <span className="text-[var(--hc-ink)]">{brl(valor)}</span>
      </div>
    );
    return (
      <li className={`hc-card p-5 ${encerrada ? "opacity-70" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Diferença de acomodação</h3>
              <span className="hc-badge">Plano · diferença</span>
              {encerrada && <span className="hc-badge">Encerrada</span>}
            </div>
            <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
              {c.pacientes?.nome} · Ficha {c.pacientes?.ref_externa_promedico || "—"} · Sol. {c.numero}
              {comp.medicoNome ? ` · Cir. ${comp.medicoNome}` : ""}
            </p>
            {comp.plano && (
              <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                Plano de saúde: <strong className="text-[var(--hc-ink)]">{comp.plano}</strong>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Total da diferença</p>
            <p className="font-semibold text-[var(--hc-ink)]">{brl(totalGeral)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-4 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Composição da diferença</p>
          {(comp.medico ?? 0) > 0 && linha("Honorário médico", comp.medico ?? 0)}
          {(comp.anestesista ?? 0) > 0 && linha("Honorário do anestesista", comp.anestesista ?? 0)}
          {(comp.auxiliar ?? 0) > 0 && linha("Honorário do médico auxiliar", comp.auxiliar ?? 0)}
          {(comp.hospital ?? 0) > 0 && linha("Taxa de sala · hospital", comp.hospital ?? 0)}
          {(c.acomodacao_total_centavos ?? 0) > 0 &&
            linha(
              `Acomodação — ${difAcomInfo(comp.tratamento ?? "cirurgico", c.acomodacao ?? "")?.nome ?? c.acomodacao} (${c.acomodacao_dias}× diária${
                (difAcomInfo(comp.tratamento ?? "cirurgico", c.acomodacao ?? "")?.taxaFixaCentavos ?? 0) > 0 ? " + taxa fixa" : ""
              })`,
              c.acomodacao_total_centavos ?? 0,
            )}
        </div>

        {/* Lançamento das diárias no acerto */}
        {!encerrada && (
          <div className="mt-4 rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">
              Acomodação — lançar diárias (acerto)
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Acomodação</span>
                <select
                  value={acom}
                  onChange={(e) => setAcom(e.target.value)}
                  className="rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]"
                >
                  <option value="">Selecionar…</option>
                  {DIFERENCA_ACOMODACAO[comp.tratamento === "clinico" ? "clinico" : "cirurgico"].map((a) => (
                    <option key={a.chave} value={a.chave}>
                      {a.nome} ({a.taxaFixaCentavos > 0 ? `taxa ${brl(a.taxaFixaCentavos)} + ` : ""}{brl(a.diariaCentavos)}/dia)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-[var(--hc-ink-soft)]">Diárias</span>
                <input
                  type="number"
                  min={1}
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  className="w-20 rounded-lg border border-[var(--hc-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hc-gold)]"
                />
              </label>
              <button onClick={lancarAcomodacao} disabled={ocupado} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">
                {c.acomodacao_dias ? "Atualizar diárias" : "Lançar diárias"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm text-[var(--hc-ink-soft)]">Total geral: </span>
            <span className="font-serif text-xl font-semibold text-[var(--hc-red-600)]">{brl(totalGeral)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => imprimirDiferenca(c)}
              className="rounded-full border border-[var(--hc-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--hc-ink)] transition-colors hover:border-[var(--hc-gold)]"
            >
              🖨 Imprimir
            </button>
            {encerrada ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">✓ Baixa dada (recebido)</span>
            ) : (
              <button onClick={darBaixa} disabled={ocupado} className="hc-btn hc-btn-primary px-6 py-2.5">
                Dar baixa (recebido)
              </button>
            )}
          </div>
        </div>
        {msg && <p className="mt-2 text-sm text-[var(--hc-red-600)]">{msg}</p>}
      </li>
    );
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
          {c.codigo_acesso && (
            <>
              <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                Código de acesso do paciente:{" "}
                <strong className="font-mono tracking-[0.2em] text-[var(--hc-gold-deep)]">{c.codigo_acesso}</strong>
                <span className="ml-1 text-xs">(repasse se ele não recebeu por WhatsApp)</span>
              </p>
              <div className="mt-2">
                <BotaoWhatsapp
                  whatsapp={c.pacientes?.telefone_whatsapp}
                  pacienteNome={c.pacientes?.nome}
                  procedimento={c.procedimento_nome}
                  codigo={c.codigo_acesso}
                  rotulo="Reenviar por WhatsApp"
                />
              </div>
            </>
          )}
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
        <div className="flex flex-wrap items-center gap-3">
          {editavel && (
            <button
              onClick={() => setEditando((v) => !v)}
              className="rounded-full border border-[var(--hc-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--hc-ink)] transition-colors hover:border-[var(--hc-gold)]"
            >
              {editando ? "Cancelar" : "✎ Editar"}
            </button>
          )}
          {encerrada ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">✓ Atendimento finalizado</span>
          ) : (
            <button onClick={finalizar} disabled={ocupado} className="hc-btn hc-btn-primary px-6 py-2.5">
              Finalizar atendimento
            </button>
          )}
        </div>
      </div>
      {!editavel && !encerrada && (
        <p className="mt-2 text-right text-xs text-[var(--hc-ink-soft)]">
          {ehInternacao
            ? `Prazo de edição (${MINUTOS_EDICAO} min) encerrado — somente a administração edita.`
            : "A cirurgia é editada pelo médico (nos primeiros 30 min) ou pela administração."}
        </p>
      )}
      {editando && editavel && (
        <FormularioEdicaoSolicitacao
          c={c}
          onCancelar={() => setEditando(false)}
          onSalvo={() => {
            setEditando(false);
            onMudou();
          }}
        />
      )}
      {msg && <p className="mt-2 text-sm text-[var(--hc-red-600)]">{msg}</p>}
    </li>
  );
}
