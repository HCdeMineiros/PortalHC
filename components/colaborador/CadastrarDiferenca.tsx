"use client";

import { useMemo, useState } from "react";
import { DIFERENCA_ACOMODACAO, difAcomInfo } from "@/lib/data/acomodacoes";

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ANESTESISTA_PCT = 0.3;
const AUXILIAR_PCT = 0.3;
const SALA_PCT = 0.5;

function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function mascararCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const inputCls =
  "w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]";

const botaoAcom = (ativo: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    ativo
      ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
      : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
  }`;

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">{label}</span>
      {children}
    </label>
  );
}

/** Item proporcional ao honorário médico, com botão para cobrar/não cobrar. */
function ItemProporcional({
  label,
  valor,
  ativo,
  onToggle,
}: {
  label: string;
  valor: number;
  ativo: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-xl border p-3 ${ativo ? "border-[var(--hc-line)] bg-white" : "border-[var(--hc-line)] bg-[var(--hc-cream-2)]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--hc-ink)]">{label}</p>
          <p className={`text-sm ${ativo ? "font-semibold text-[var(--hc-ink)]" : "text-[var(--hc-ink-soft)] line-through"}`}>
            {ativo ? brl(valor) : "Não será cobrado"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`flex-none rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            ativo
              ? "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-red-600)] hover:text-[var(--hc-red-600)]"
              : "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white"
          }`}
        >
          {ativo ? "Não cobrar" : "Incluir"}
        </button>
      </div>
    </div>
  );
}

interface Cadastrada {
  numero: string;
  pacienteNome: string;
  total: number;
}

export function CadastrarDiferenca({ onCadastrar }: { onCadastrar?: () => void }) {
  const [cirurgiaoNome, setCirurgiaoNome] = useState("");
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteCpf, setPacienteCpf] = useState("");
  const [pacienteFicha, setPacienteFicha] = useState("");
  const [planoSaude, setPlanoSaude] = useState("");
  const [medicoStr, setMedicoStr] = useState("");
  const [cobrarAnestesista, setCobrarAnestesista] = useState(true);
  const [cobrarAuxiliar, setCobrarAuxiliar] = useState(true);
  const [cobrarSala, setCobrarSala] = useState(true);
  const [tratamento, setTratamento] = useState<"clinico" | "cirurgico">("cirurgico");
  const [acomodacaoDif, setAcomodacaoDif] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastradas, setCadastradas] = useState<Cadastrada[]>([]);

  const calc = useMemo(() => {
    const base = paraCentavos(medicoStr);
    const anestesista = cobrarAnestesista ? Math.round(base * ANESTESISTA_PCT) : 0;
    const auxiliar = cobrarAuxiliar ? Math.round(base * AUXILIAR_PCT) : 0;
    const sala = cobrarSala ? Math.round(base * SALA_PCT) : 0;
    return { base, anestesista, auxiliar, sala, total: base + anestesista + auxiliar + sala };
  }, [medicoStr, cobrarAnestesista, cobrarAuxiliar, cobrarSala]);

  // valor de referência da acomodação por diária (as diárias são lançadas no acerto)
  const acomInfo = useMemo(() => difAcomInfo(tratamento, acomodacaoDif), [tratamento, acomodacaoDif]);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpf = pacienteCpf.replace(/\D/g, "");
    if (!cirurgiaoNome.trim()) return setErro("Informe o nome do médico cirurgião.");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente.");
    if (cpf.length !== 11) return setErro("Informe o CPF do paciente (11 dígitos).");
    if (!pacienteFicha.trim()) return setErro("Informe o número da ficha.");
    if (!planoSaude.trim()) return setErro("Informe o plano de saúde.");
    if (calc.total <= 0 && !acomodacaoDif) return setErro("Informe o honorário médico e/ou selecione a acomodação.");

    setEnviando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return setErro("Sessão expirada. Faça login novamente.");
      const resp = await fetch("/api/colaborador/cadastrar-diferenca", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cirurgiaoNome: cirurgiaoNome.trim(),
          pacienteNome: pacienteNome.trim(),
          pacienteCpf: cpf,
          pacienteFicha: pacienteFicha.trim(),
          planoSaude: planoSaude.trim(),
          honorarioMedicoCentavos: calc.base,
          cobrarAnestesista,
          cobrarAuxiliar,
          cobrarSala,
          tratamento,
          acomodacao: acomodacaoDif,
        }),
      });
      const json = await resp.json();
      if (!resp.ok) return setErro(json?.erro || "Falha ao cadastrar.");
      setCadastradas((prev) => [{ numero: json.numero, pacienteNome: pacienteNome.trim(), total: json.total_centavos ?? calc.total }, ...prev]);
      setCirurgiaoNome("");
      setPacienteNome(""); setPacienteCpf(""); setPacienteFicha(""); setPlanoSaude("");
      setMedicoStr("");
      setCobrarAnestesista(true); setCobrarAuxiliar(true); setCobrarSala(true);
      setTratamento("cirurgico"); setAcomodacaoDif("");
      onCadastrar?.();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Plano de saúde · diferença</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">
        Cadastrar diferença de acomodação
      </h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Para o paciente de plano (enfermaria) que sobe de acomodação pagando a diferença.
        Informe o <strong>honorário médico</strong>; os demais são proporcionais (anestesista 30%,
        auxiliar 30% e taxa de sala 50%) e podem ser desativados se não houver cobrança.
      </p>

      <form onSubmit={cadastrar} className="mt-6 space-y-6">
        <Campo label="Médico cirurgião">
          <input value={cirurgiaoNome} onChange={(e) => setCirurgiaoNome(e.target.value)} placeholder="Nome do cirurgião" className={inputCls} />
        </Campo>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Valores da diferença */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Valores da diferença</p>
            <Campo label="Honorário médico (R$)">
              <input inputMode="decimal" value={medicoStr} onChange={(e) => setMedicoStr(e.target.value)} placeholder="0,00" className={inputCls} />
            </Campo>
            <ItemProporcional label="Honorário do anestesista (30%)" valor={calc.anestesista} ativo={cobrarAnestesista} onToggle={() => setCobrarAnestesista((v) => !v)} />
            <ItemProporcional label="Honorário do médico auxiliar (30%)" valor={calc.auxiliar} ativo={cobrarAuxiliar} onToggle={() => setCobrarAuxiliar((v) => !v)} />
            <ItemProporcional label="Taxa de sala · hospital (50%)" valor={calc.sala} ativo={cobrarSala} onToggle={() => setCobrarSala((v) => !v)} />

            {/* Acomodação (tabela da diferença) */}
            <div className="space-y-3 border-t border-[var(--hc-line)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Acomodação</p>
              <div>
                <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Tipo de tratamento</span>
                <div className="flex flex-wrap gap-2">
                  {([
                    { chave: "cirurgico", nome: "Cirúrgico" },
                    { chave: "clinico", nome: "Clínico" },
                  ] as const).map((t) => (
                    <button
                      key={t.chave}
                      type="button"
                      onClick={() => setTratamento(t.chave)}
                      className={botaoAcom(tratamento === t.chave)}
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Acomodação</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAcomodacaoDif("")} className={botaoAcom(acomodacaoDif === "")}>
                    Nenhuma
                  </button>
                  {DIFERENCA_ACOMODACAO[tratamento].map((a) => (
                    <button key={a.chave} type="button" onClick={() => setAcomodacaoDif(a.chave)} className={botaoAcom(acomodacaoDif === a.chave)}>
                      {a.nome}
                    </button>
                  ))}
                </div>
              </div>
              {acomodacaoDif && acomInfo && (
                <p className="text-sm text-[var(--hc-ink-soft)]">
                  Valor de referência:{" "}
                  {acomInfo.taxaFixaCentavos > 0 ? `taxa fixa ${brl(acomInfo.taxaFixaCentavos)} + ` : ""}
                  {brl(acomInfo.diariaCentavos)}/diária.{" "}
                  <strong className="text-[var(--hc-ink)]">As diárias e o total serão lançados no acerto (fechamento).</strong>
                </p>
              )}
            </div>
          </div>

          {/* Paciente + total */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Paciente</p>
            <Campo label="Nome completo">
              <input value={pacienteNome} onChange={(e) => setPacienteNome(e.target.value)} placeholder="Nome completo" className={inputCls} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="CPF">
                <input inputMode="numeric" value={pacienteCpf} onChange={(e) => setPacienteCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
              </Campo>
              <Campo label="Nº da ficha (PROMÉDICO)">
                <input value={pacienteFicha} onChange={(e) => setPacienteFicha(e.target.value)} placeholder="Ex.: 170245" className={inputCls} />
              </Campo>
            </div>
            <Campo label="Plano de saúde">
              <input value={planoSaude} onChange={(e) => setPlanoSaude(e.target.value)} placeholder="Ex.: Unimed, Bradesco Saúde…" className={inputCls} />
            </Campo>

            <div className="rounded-2xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Honorários (parcial)</span>
                <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">{brl(calc.total)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--hc-ink-soft)]">A acomodação (diárias) entra no acerto, dentro do cadastro.</p>
            </div>

            {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
            <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary w-full">
              {enviando ? "Salvando…" : "Cadastrar diferença de acomodação"}
            </button>
          </div>
        </div>
      </form>

      {cadastradas.length > 0 && (
        <div className="mt-8 border-t border-[var(--hc-line)] pt-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Diferenças cadastradas ({cadastradas.length})</h3>
          <ul className="mt-3 space-y-3">
            {cadastradas.map((c) => (
              <li key={c.numero} className="hc-card hc-gold-frame flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-[var(--hc-ink)]">Diferença de acomodação</p>
                  <p className="text-sm text-[var(--hc-ink-soft)]">{c.pacienteNome} · Sol. <strong className="text-[var(--hc-ink)]">{c.numero}</strong></p>
                </div>
                <p className="font-semibold text-[var(--hc-red-600)]">{brl(c.total)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
