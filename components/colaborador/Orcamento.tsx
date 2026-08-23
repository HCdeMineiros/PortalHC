"use client";

import { useMemo, useState } from "react";
import { PROCEDIMENTOS } from "@/lib/data/procedimentos";
import { ACOMODACOES, TAXA_FIXA_CIRURGICA_CENTAVOS } from "@/lib/data/acomodacoes";
import { HOSPITAL } from "@/lib/brand";

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const ANESTESISTA_PCT = 0.3;
const AUXILIAR_MEDICO_PCT = 0.3;
const INSTRUMENTADOR_PCT = 0.1;
const PEDIATRA_PCT = 0.35;
const HOSPITAL_PCT = 0.6;

const inputCls =
  "w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]";
const toggle = (ativo: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    ativo
      ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
      : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
  }`;

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m] as string);

interface Outro {
  desc: string;
  valorStr: string;
}

export function Orcamento() {
  const [tipo, setTipo] = useState<"cirurgico" | "clinico">("cirurgico");
  const [pacienteNome, setPacienteNome] = useState("");
  const [procNome, setProcNome] = useState("");
  const [cirurgiaoStr, setCirurgiaoStr] = useState("");
  const [anestesista, setAnestesista] = useState(true);
  const [auxiliarMedico, setAuxiliarMedico] = useState(true);
  const [instrumentador, setInstrumentador] = useState(false);
  const [pediatra, setPediatra] = useState(false);
  const [acomodacao, setAcomodacao] = useState("");
  const [diarias, setDiarias] = useState("1");
  const [taxaFixaAtiva, setTaxaFixaAtiva] = useState(true);
  const [outros, setOutros] = useState<Outro[]>([]);

  function escolherProcedimento(codigo: string) {
    const p = PROCEDIMENTOS.find((x) => x.codigo === codigo);
    if (!p) {
      setProcNome("");
      return;
    }
    setProcNome(p.nome);
    setCirurgiaoStr((p.componentesCentavos.cirurgiao / 100).toString());
  }

  const calc = useMemo(() => {
    const cir = tipo === "cirurgico" ? paraCentavos(cirurgiaoStr) : 0;
    const anest = anestesista ? Math.round(cir * ANESTESISTA_PCT) : 0;
    const auxMed = auxiliarMedico ? Math.round(cir * AUXILIAR_MEDICO_PCT) : 0;
    const instr = instrumentador ? Math.round(cir * INSTRUMENTADOR_PCT) : 0;
    const pedi = pediatra ? Math.round(cir * PEDIATRA_PCT) : 0;
    const hosp = Math.round(cir * HOSPITAL_PCT);
    const honorarios = cir + anest + auxMed + instr + pedi + hosp;

    const info = ACOMODACOES.find((a) => a.chave === acomodacao);
    const dias = Math.max(1, parseInt(diarias) || 0);
    const taxaFixa = info && taxaFixaAtiva ? TAXA_FIXA_CIRURGICA_CENTAVOS : 0;
    const acomTotal = info ? taxaFixa + info.totalDiaCentavos * dias : 0;

    const outrosItens = outros
      .map((o) => ({ desc: o.desc.trim() || "Outros", val: paraCentavos(o.valorStr) }))
      .filter((o) => o.val > 0);
    const outrosTotal = outrosItens.reduce((s, o) => s + o.val, 0);

    return { cir, anest, auxMed, instr, pedi, hosp, honorarios, info, dias, taxaFixa, acomTotal, outrosItens, outrosTotal, total: honorarios + acomTotal + outrosTotal };
  }, [tipo, cirurgiaoStr, anestesista, auxiliarMedico, instrumentador, pediatra, acomodacao, diarias, taxaFixaAtiva, outros]);

  function imprimir() {
    const linhas: string[] = [];
    const linha = (rot: string, val: number) => `<tr><td>${esc(rot)}</td><td class="v">${brl(val)}</td></tr>`;
    if (tipo === "cirurgico" && calc.cir > 0) {
      linhas.push(linha(`Cirurgião${procNome ? ` — ${procNome}` : ""}`, calc.cir));
      if (calc.anest > 0) linhas.push(linha("Anestesista (30%)", calc.anest));
      if (calc.auxMed > 0) linhas.push(linha("Auxiliar médico (30%)", calc.auxMed));
      if (calc.instr > 0) linhas.push(linha("Instrumentador (10%)", calc.instr));
      if (calc.pedi > 0) linhas.push(linha("Pediatra (35%)", calc.pedi));
      linhas.push(linha("Taxa de sala · hospital (60%)", calc.hosp));
    }
    if (calc.info) {
      const rot = `Acomodação — ${calc.info.nome} (${calc.dias}× diária${calc.taxaFixa > 0 ? " + taxa fixa" : ""})`;
      linhas.push(linha(rot, calc.acomTotal));
    }
    for (const o of calc.outrosItens) linhas.push(linha(o.desc, o.val));

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Orçamento — ${esc(HOSPITAL.nomeCurto)}</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;color:#1A1616;margin:32px;}
  .top{border-bottom:2px solid #C9A227;padding-bottom:12px;}
  .hosp{font-size:18px;font-weight:bold;} .sub{font-size:12px;color:#4B4444;}
  h1{font-size:20px;margin:20px 0 4px;} .meta{font-size:12px;color:#4B4444;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;font-size:14px;} td{padding:6px 0;border-bottom:1px dashed #E7DFD5;}
  td.v{text-align:right;font-variant-numeric:tabular-nums;}
  .total{display:flex;justify-content:space-between;margin-top:12px;font-size:16px;font-weight:bold;}
  .total .g{color:#C8102E;font-size:22px;}
  .aviso{margin-top:24px;font-size:12px;color:#4B4444;border:1px solid #E7DFD5;border-radius:8px;padding:10px 14px;}
  .rodape{margin-top:22px;font-size:11px;color:#4B4444;text-align:center;}
  @media print{body{margin:16mm;}}
</style></head><body>
  <div class="top"><div class="hosp">${esc(HOSPITAL.nome)}</div>
  <div class="sub">${esc(HOSPITAL.endereco)} · ${esc(HOSPITAL.cidade)} · ${esc(HOSPITAL.telefones.join(" · "))}</div></div>
  <h1>Orçamento — estimativa</h1>
  <div class="meta">${pacienteNome ? `Paciente: <b>${esc(pacienteNome)}</b> · ` : ""}Emitido em ${esc(new Date().toLocaleString("pt-BR"))} · Tratamento ${tipo === "cirurgico" ? "cirúrgico" : "clínico"}</div>
  <table>${linhas.join("")}</table>
  <div class="total"><span>Total estimado</span><span class="g">${brl(calc.total)}</span></div>
  <div class="aviso"><b>Aviso:</b> valores estimados para orientação do paciente (tabela particular). O valor final pode variar conforme o número de diárias e os itens efetivamente utilizados no atendimento. <b>Materiais e medicamentos terão o valor apenas ao final do procedimento.</b></div>
  <div class="rodape">${esc(HOSPITAL.nomeCurto)} · ${esc(HOSPITAL.dominio)}</div>
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

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Prévia ao paciente</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">Orçamento (estimativa)</h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Simulação de valores (tabela particular) para dar uma prévia ao paciente. Não salva nada — apenas calcula e imprime.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Entradas */}
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Nome do paciente (opcional)</span>
            <input value={pacienteNome} onChange={(e) => setPacienteNome(e.target.value)} placeholder="Para constar no orçamento" className={inputCls} />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Tipo de tratamento</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTipo("cirurgico")} className={toggle(tipo === "cirurgico")}>Cirúrgico</button>
              <button type="button" onClick={() => setTipo("clinico")} className={toggle(tipo === "clinico")}>Clínico</button>
            </div>
          </div>

          {tipo === "cirurgico" && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Cirurgia (catálogo)</span>
                <select onChange={(e) => escolherProcedimento(e.target.value)} className={inputCls} defaultValue="">
                  <option value="">Selecionar do catálogo…</option>
                  {PROCEDIMENTOS.map((p) => (
                    <option key={p.codigo} value={p.codigo}>{p.nome}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Valor do cirurgião (R$)</span>
                <input inputMode="decimal" value={cirurgiaoStr} onChange={(e) => setCirurgiaoStr(e.target.value)} placeholder="0,00" className={inputCls} />
              </label>
              <div>
                <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Itens do procedimento</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAnestesista((v) => !v)} className={toggle(anestesista)}>{anestesista ? "✓ " : ""}Anestesista (30%)</button>
                  <button type="button" onClick={() => setAuxiliarMedico((v) => !v)} className={toggle(auxiliarMedico)}>{auxiliarMedico ? "✓ " : ""}Auxiliar médico (30%)</button>
                  <button type="button" onClick={() => setInstrumentador((v) => !v)} className={toggle(instrumentador)}>{instrumentador ? "✓ " : ""}Instrumentador (10%)</button>
                  <button type="button" onClick={() => setPediatra((v) => !v)} className={toggle(pediatra)}>{pediatra ? "✓ " : ""}Pediatra (35%)</button>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-[var(--hc-line)] pt-4">
            <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Acomodação (particular)</span>
            <select value={acomodacao} onChange={(e) => setAcomodacao(e.target.value)} className={inputCls}>
              <option value="">Sem acomodação</option>
              {ACOMODACOES.map((a) => (
                <option key={a.chave} value={a.chave}>{a.nome} · {brl(a.totalDiaCentavos)}/dia</option>
              ))}
            </select>
            {acomodacao && (
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="block w-32">
                  <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Diárias</span>
                  <input type="number" min={1} value={diarias} onChange={(e) => setDiarias(e.target.value)} className={inputCls} />
                </label>
                <button type="button" onClick={() => setTaxaFixaAtiva((v) => !v)} className={toggle(taxaFixaAtiva)}>
                  {taxaFixaAtiva ? "✓ " : ""}Taxa fixa ({brl(TAXA_FIXA_CIRURGICA_CENTAVOS)})
                </button>
              </div>
            )}
          </div>

          {/* Outros valores (taxa de RN, vídeo, etc.) */}
          <div className="border-t border-[var(--hc-line)] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--hc-ink)]">Outros (taxa de RN, vídeo, etc.)</span>
              <button type="button" onClick={() => setOutros((p) => [...p, { desc: "", valorStr: "" }])} className="hc-btn hc-btn-ghost px-3 py-1.5 text-xs">
                + Adicionar
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {outros.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={o.desc}
                    onChange={(e) => setOutros((p) => p.map((x, idx) => (idx === i ? { ...x, desc: e.target.value } : x)))}
                    placeholder="Descrição (ex.: Taxa de RN)"
                    className={inputCls}
                  />
                  <input
                    inputMode="decimal"
                    value={o.valorStr}
                    onChange={(e) => setOutros((p) => p.map((x, idx) => (idx === i ? { ...x, valorStr: e.target.value } : x)))}
                    placeholder="R$ 0,00"
                    className="w-32 rounded-xl border border-[var(--hc-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--hc-gold)]"
                  />
                  <button type="button" onClick={() => setOutros((p) => p.filter((_, idx) => idx !== i))} aria-label="Remover" className="flex-none rounded-xl border border-[var(--hc-line)] px-3 text-[var(--hc-red-600)] hover:bg-[var(--hc-red-050)]">
                    ✕
                  </button>
                </div>
              ))}
              {outros.length === 0 && <p className="text-xs text-[var(--hc-ink-soft)]">Nenhum item extra. Use para taxas avulsas (RN, vídeo, etc.).</p>}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="space-y-3 rounded-2xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
          <p className="text-sm font-semibold text-[var(--hc-ink)]">Resumo do orçamento</p>
          {tipo === "cirurgico" && calc.cir > 0 && (
            <>
              <Linha rot={`Cirurgião${procNome ? ` — ${procNome}` : ""}`} val={calc.cir} />
              {calc.anest > 0 && <Linha rot="Anestesista (30%)" val={calc.anest} />}
              {calc.auxMed > 0 && <Linha rot="Auxiliar médico (30%)" val={calc.auxMed} />}
              {calc.instr > 0 && <Linha rot="Instrumentador (10%)" val={calc.instr} />}
              {calc.pedi > 0 && <Linha rot="Pediatra (35%)" val={calc.pedi} />}
              <Linha rot="Taxa de sala · hospital (60%)" val={calc.hosp} />
            </>
          )}
          {calc.info && (
            <Linha
              rot={`Acomodação — ${calc.info.nome} (${calc.dias}× diária${calc.taxaFixa > 0 ? " + taxa fixa" : ""})`}
              val={calc.acomTotal}
            />
          )}
          {calc.outrosItens.map((o, i) => (
            <Linha key={i} rot={o.desc} val={o.val} />
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--hc-line)] pt-3">
            <span className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Total estimado</span>
            <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">{brl(calc.total)}</span>
          </div>
          <button onClick={imprimir} disabled={calc.total <= 0} className="hc-btn hc-btn-primary mt-2 w-full disabled:opacity-50">
            🖨 Imprimir orçamento
          </button>
          <p className="text-[11px] text-[var(--hc-ink-soft)]">
            Valores estimados (tabela particular). Materiais e medicamentos só terão valor ao final do procedimento.
          </p>
        </div>
      </div>
    </div>
  );
}

function Linha({ rot, val }: { rot: string; val: number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-[var(--hc-ink-soft)]">{rot}</span>
      <span className="text-[var(--hc-ink)]">{brl(val)}</span>
    </div>
  );
}
