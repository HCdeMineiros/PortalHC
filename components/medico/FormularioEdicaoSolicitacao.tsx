"use client";

import { useState } from "react";

function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function mascararCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export const MINUTOS_EDICAO = 30;

/**
 * Regra de edição:
 * - Administrador (admin_dpo) edita sempre, qualquer tipo.
 * - Médico edita nos primeiros 30 min (cirurgia e internação que cadastrou).
 * - Equipe (internação/faturamento) edita nos primeiros 30 min, SOMENTE internação.
 */
export function podeEditar(criadoEm: string | null | undefined, papel: string, tipo: string): boolean {
  if (papel === "admin_dpo") return true;
  if (!criadoEm) return false;
  const ms = Date.now() - new Date(criadoEm).getTime();
  const dentro30 = ms >= 0 && ms <= MINUTOS_EDICAO * 60 * 1000;
  if (!dentro30) return false;
  const ehEquipe = ["internacao", "faturamento"].includes(papel);
  if (ehEquipe) return tipo === "internacao_clinica";
  return true; // médico
}

export interface EdicaoDados {
  id: string;
  tipo: string;
  procedimento_nome: string | null;
  componentes_centavos: { cirurgiao?: number; auxiliar?: number } | null;
  acomodacao: string | null;
  pacientes: {
    nome: string;
    cpf: string | null;
    data_nascimento: string | null;
    ref_externa_promedico: string | null;
    telefone_whatsapp: string | null;
  } | null;
}

async function token() {
  const { criarClienteBrowser } = await import("@/lib/supabase/client");
  const { data } = await criarClienteBrowser().auth.getSession();
  return data.session?.access_token;
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

/** Formulário de correção de uma solicitação (cirurgia ou internação). */
export function FormularioEdicaoSolicitacao({
  c,
  onCancelar,
  onSalvo,
}: {
  c: EdicaoDados;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const ehInternacao = c.tipo === "internacao_clinica";
  const cirurgiaoInicial = c.componentes_centavos?.cirurgiao ?? 0;
  const auxInicial =
    cirurgiaoInicial > 0 && (c.componentes_centavos?.auxiliar ?? 0) / cirurgiaoInicial < 0.2 ? 0.1 : 0.3;

  const [nome, setNome] = useState(c.procedimento_nome ?? "");
  const [cirurgiaoStr, setCirurgiaoStr] = useState(cirurgiaoInicial ? (cirurgiaoInicial / 100).toString() : "");
  const [auxiliarPct, setAuxiliarPct] = useState(auxInicial);
  const [acomodacao, setAcomodacao] = useState(c.acomodacao ?? "");
  const [pacienteNome, setPacienteNome] = useState(c.pacientes?.nome ?? "");
  const [pacienteCpf, setPacienteCpf] = useState(mascararCpf(c.pacientes?.cpf ?? ""));
  const [pacienteNascimento, setPacienteNascimento] = useState(c.pacientes?.data_nascimento ?? "");
  const [pacienteFicha, setPacienteFicha] = useState(c.pacientes?.ref_externa_promedico ?? "");
  const [pacienteWhats, setPacienteWhats] = useState(c.pacientes?.telefone_whatsapp ?? "");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro("");
    const cpf = pacienteCpf.replace(/\D/g, "");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente.");
    if (cpf.length !== 11) return setErro("CPF do paciente inválido (11 dígitos).");
    if (!pacienteNascimento) return setErro("Informe a data de nascimento.");
    if (!pacienteFicha.trim()) return setErro("Informe o número da ficha.");
    if (ehInternacao) {
      if (!acomodacao) return setErro("Selecione a acomodação.");
    } else {
      if (!nome.trim()) return setErro("Informe o nome da cirurgia.");
      if (paraCentavos(cirurgiaoStr) <= 0) return setErro("Informe o valor do cirurgião.");
    }

    setSalvando(true);
    try {
      const t = await token();
      const resp = await fetch("/api/medico/editar-solicitacao", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({
          id: c.id,
          nome: nome.trim(),
          cirurgiaoCentavos: paraCentavos(cirurgiaoStr),
          auxiliarPct,
          acomodacao,
          pacienteNome: pacienteNome.trim(),
          pacienteCpf: cpf,
          pacienteNascimento,
          pacienteFicha: pacienteFicha.trim(),
          pacienteWhatsapp: pacienteWhats.trim(),
        }),
      });
      const json = await resp.json();
      if (!resp.ok) return setErro(json?.erro || "Falha ao salvar.");
      onSalvo();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-[var(--hc-gold)]/40 bg-[var(--hc-cream)] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">
        Editar {ehInternacao ? "internação" : "cirurgia"}
      </p>

      {!ehInternacao && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome da cirurgia">
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="Valor do cirurgião (R$)">
            <input inputMode="decimal" value={cirurgiaoStr} onChange={(e) => setCirurgiaoStr(e.target.value)} placeholder="0,00" className={inputCls} />
          </Campo>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Auxiliar</span>
            <div className="flex flex-wrap gap-3">
              {[
                { pct: 0.3, rotulo: "Auxiliar médico (30%)" },
                { pct: 0.1, rotulo: "Instrumentador (10%)" },
              ].map((o) => (
                <button
                  key={o.pct}
                  type="button"
                  onClick={() => setAuxiliarPct(o.pct)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    auxiliarPct === o.pct
                      ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
                      : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
                  }`}
                >
                  {o.rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {ehInternacao && (
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Acomodação</span>
          <div className="flex flex-wrap gap-3">
            {[
              { chave: "enfermaria", nome: "Enfermaria" },
              { chave: "apartamento", nome: "Apartamento" },
              { chave: "suite", nome: "Suíte" },
            ].map((a) => (
              <button
                key={a.chave}
                type="button"
                onClick={() => setAcomodacao(a.chave)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  acomodacao === a.chave
                    ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
                    : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-[var(--hc-line)] pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Paciente</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome do paciente">
            <input value={pacienteNome} onChange={(e) => setPacienteNome(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="CPF">
            <input inputMode="numeric" value={pacienteCpf} onChange={(e) => setPacienteCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
          </Campo>
          <Campo label="Data de nascimento">
            <input type="date" value={pacienteNascimento} onChange={(e) => setPacienteNascimento(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="Nº da ficha (PROMÉDICO)">
            <input value={pacienteFicha} onChange={(e) => setPacienteFicha(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="WhatsApp">
            <input value={pacienteWhats} onChange={(e) => setPacienteWhats(e.target.value)} placeholder="(64) 9xxxx-xxxx" className={inputCls} />
          </Campo>
        </div>
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={salvar} disabled={salvando} className="hc-btn hc-btn-primary px-6 py-2.5">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
        <button onClick={onCancelar} disabled={salvando} className="hc-btn hc-btn-ghost px-4 py-2.5">
          Cancelar
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[var(--hc-ink-soft)]">
        O código de acesso do paciente não muda ao editar.
      </p>
    </div>
  );
}
