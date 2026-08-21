"use client";

import { useCallback, useEffect, useState } from "react";
import { ACOMODACOES } from "@/lib/data/acomodacoes";

const brl = (c: number | null | undefined) =>
  ((c ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function mascararCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

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

const nomeAcom = (chave: string | null) => ACOMODACOES.find((a) => a.chave === chave)?.nome ?? "—";

interface Componentes {
  cirurgiao?: number;
  anestesista?: number;
  auxiliar?: number;
  hospital?: number;
}

interface Solicitacao {
  id: string;
  numero: string;
  tipo: string;
  status: string;
  procedimento_nome: string | null;
  componentes_centavos: Componentes | null;
  valor_total_centavos: number | null;
  codigo_acesso: string | null;
  acomodacao: string | null;
  acomodacao_dias: number | null;
  acomodacao_total_centavos: number | null;
  finalizada_em: string | null;
  docs_total: number;
  docs_ok: number;
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

export function MinhasSolicitacoes({ versao = 0 }: { versao?: number }) {
  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const t = await token();
      const resp = await fetch("/api/medico/minhas-solicitacoes", { headers: { Authorization: `Bearer ${t}` } });
      const json = await resp.json();
      if (!resp.ok) setErro(json?.erro || "Falha ao carregar.");
      else setItens(json.solicitacoes ?? []);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar, versao]);

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Meus cadastros</h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            {itens.length} {itens.length === 1 ? "solicitação" : "solicitações"} · permanecem aqui até a exclusão pelo faturamento
          </p>
        </div>
        <button onClick={carregar} className="hc-btn hc-btn-ghost px-4 py-2 text-sm">Atualizar</button>
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}

      {carregando ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
      ) : itens.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--hc-ink-soft)]">
          Nenhum cadastro ainda. Cirurgias e internações que você cadastrar aparecem aqui.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {itens.map((c) => {
            const ehInternacao = c.tipo === "internacao_clinica";
            const encerrada = c.status === "encerrada";
            const emEdicao = editando === c.id;
            return (
              <li key={c.id} className={`hc-card hc-gold-frame p-4 ${encerrada ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
                        {c.procedimento_nome || (ehInternacao ? "Internação clínica" : "Cirurgia")}
                      </h3>
                      <span className="hc-badge">{ehInternacao ? "Internação" : "Cirurgia"}</span>
                      <span className="hc-badge">{STATUS_ROTULO[c.status] ?? c.status}</span>
                      <StatusDocumentos ok={c.docs_ok} total={c.docs_total} />
                    </div>
                    <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                      {c.pacientes?.nome} · Ficha {c.pacientes?.ref_externa_promedico || "—"} · Sol. {c.numero}
                      {ehInternacao && c.acomodacao ? ` · ${nomeAcom(c.acomodacao)}` : ""}
                    </p>
                    {c.codigo_acesso && (
                      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
                        Código de acesso do paciente:{" "}
                        <strong className="font-mono tracking-[0.2em] text-[var(--hc-gold-deep)]">{c.codigo_acesso}</strong>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {ehInternacao ? (
                      <>
                        <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Acomodação</p>
                        <p className="font-semibold text-[var(--hc-ink)]">
                          {(c.acomodacao_dias ?? 0) > 0 ? brl(c.acomodacao_total_centavos) : "a lançar pela equipe"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Cirurgia</p>
                        <p className="font-semibold text-[var(--hc-ink)]">{brl(c.valor_total_centavos)}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                {!encerrada && (
                  <div className="mt-3 flex justify-end border-t border-[var(--hc-line)] pt-3">
                    <button
                      onClick={() => setEditando(emEdicao ? null : c.id)}
                      className="rounded-full border border-[var(--hc-line)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--hc-ink)] transition-colors hover:border-[var(--hc-gold)]"
                    >
                      {emEdicao ? "Cancelar" : "✎ Editar"}
                    </button>
                  </div>
                )}

                {emEdicao && (
                  <FormularioEdicao
                    c={c}
                    onCancelar={() => setEditando(null)}
                    onSalvo={() => {
                      setEditando(null);
                      carregar();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
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

function FormularioEdicao({ c, onCancelar, onSalvo }: { c: Solicitacao; onCancelar: () => void; onSalvo: () => void }) {
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
