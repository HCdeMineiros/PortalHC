"use client";

import { useCallback, useEffect, useState } from "react";
import { ACOMODACOES } from "@/lib/data/acomodacoes";
import { FormularioEdicaoSolicitacao, podeEditar, MINUTOS_EDICAO } from "./FormularioEdicaoSolicitacao";

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

const nomeAcom = (chave: string | null) => ACOMODACOES.find((a) => a.chave === chave)?.nome ?? "—";

interface Componentes {
  cirurgiao?: number;
  auxiliar?: number;
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
  criado_em: string;
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
  const [papel, setPapel] = useState("");
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
      else {
        setItens(json.solicitacoes ?? []);
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
            const editavel = !encerrada && podeEditar(c.criado_em, papel, c.tipo);
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

                {/* Ações — Editar (30 min do cadastro; admin sempre) */}
                {!encerrada && (
                  <div className="mt-3 flex items-center justify-end gap-3 border-t border-[var(--hc-line)] pt-3">
                    {editavel ? (
                      <button
                        onClick={() => setEditando(emEdicao ? null : c.id)}
                        className="rounded-full border border-[var(--hc-line)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--hc-ink)] transition-colors hover:border-[var(--hc-gold)]"
                      >
                        {emEdicao ? "Cancelar" : "✎ Editar"}
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--hc-ink-soft)]">
                        Prazo de edição ({MINUTOS_EDICAO} min) encerrado — fale com a administração.
                      </span>
                    )}
                  </div>
                )}

                {emEdicao && editavel && (
                  <FormularioEdicaoSolicitacao
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
