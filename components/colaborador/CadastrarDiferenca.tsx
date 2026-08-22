"use client";

import { useMemo, useState } from "react";

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">{label}</span>
      {children}
    </label>
  );
}

interface Cadastrada {
  numero: string;
  pacienteNome: string;
  total: number;
}

export function CadastrarDiferenca({ onCadastrar }: { onCadastrar?: () => void }) {
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteCpf, setPacienteCpf] = useState("");
  const [pacienteFicha, setPacienteFicha] = useState("");
  const [planoSaude, setPlanoSaude] = useState("");
  const [medicoStr, setMedicoStr] = useState("");
  const [anestesistaStr, setAnestesistaStr] = useState("");
  const [auxiliarStr, setAuxiliarStr] = useState("");
  const [salaStr, setSalaStr] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastradas, setCadastradas] = useState<Cadastrada[]>([]);

  const total = useMemo(
    () => paraCentavos(medicoStr) + paraCentavos(anestesistaStr) + paraCentavos(auxiliarStr) + paraCentavos(salaStr),
    [medicoStr, anestesistaStr, auxiliarStr, salaStr],
  );

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpf = pacienteCpf.replace(/\D/g, "");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente.");
    if (cpf.length !== 11) return setErro("Informe o CPF do paciente (11 dígitos).");
    if (!pacienteFicha.trim()) return setErro("Informe o número da ficha.");
    if (!planoSaude.trim()) return setErro("Informe o plano de saúde.");
    if (total <= 0) return setErro("Informe ao menos um valor da diferença.");

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
          pacienteNome: pacienteNome.trim(),
          pacienteCpf: cpf,
          pacienteFicha: pacienteFicha.trim(),
          planoSaude: planoSaude.trim(),
          honorarioMedicoCentavos: paraCentavos(medicoStr),
          anestesistaCentavos: paraCentavos(anestesistaStr),
          auxiliarCentavos: paraCentavos(auxiliarStr),
          taxaSalaCentavos: paraCentavos(salaStr),
        }),
      });
      const json = await resp.json();
      if (!resp.ok) return setErro(json?.erro || "Falha ao cadastrar.");
      setCadastradas((prev) => [{ numero: json.numero, pacienteNome: pacienteNome.trim(), total: json.total_centavos ?? total }, ...prev]);
      setPacienteNome(""); setPacienteCpf(""); setPacienteFicha(""); setPlanoSaude("");
      setMedicoStr(""); setAnestesistaStr(""); setAuxiliarStr(""); setSalaStr("");
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
        Informe os valores a acrescentar.
      </p>

      <form onSubmit={cadastrar} className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Valores da diferença */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Valores da diferença</p>
          <Campo label="Honorário médico (R$)">
            <input inputMode="decimal" value={medicoStr} onChange={(e) => setMedicoStr(e.target.value)} placeholder="0,00" className={inputCls} />
          </Campo>
          <Campo label="Honorário do anestesista (R$)">
            <input inputMode="decimal" value={anestesistaStr} onChange={(e) => setAnestesistaStr(e.target.value)} placeholder="0,00" className={inputCls} />
          </Campo>
          <Campo label="Honorário do médico auxiliar (R$)">
            <input inputMode="decimal" value={auxiliarStr} onChange={(e) => setAuxiliarStr(e.target.value)} placeholder="0,00" className={inputCls} />
          </Campo>
          <Campo label="Taxa de sala · hospital (R$)">
            <input inputMode="decimal" value={salaStr} onChange={(e) => setSalaStr(e.target.value)} placeholder="0,00" className={inputCls} />
          </Campo>
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
              <span className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Total da diferença</span>
              <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">{brl(total)}</span>
            </div>
          </div>

          {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
          <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary w-full">
            {enviando ? "Salvando…" : "Cadastrar diferença de acomodação"}
          </button>
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
