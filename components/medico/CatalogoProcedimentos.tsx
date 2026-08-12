"use client";

import { useMemo, useState } from "react";
import { PROCEDIMENTOS, TABELA_VERSAO, type Procedimento } from "@/lib/data/procedimentos";

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CatalogoProcedimentos({
  onUsar,
}: {
  /** ao escolher uma cirurgia já ativa, preenche o formulário de cadastro acima */
  onUsar?: (p: Procedimento) => void;
}) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return PROCEDIMENTOS;
    return PROCEDIMENTOS.filter((p) => p.nome.toLowerCase().includes(q));
  }, [busca]);

  return (
    <div className="hc-card p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">
            Banco de procedimentos
          </h2>
          <p className="text-sm text-[var(--hc-ink-soft)]">
            {PROCEDIMENTOS.length} cirurgias · valores particulares · tabela {TABELA_VERSAO}
          </p>
        </div>
        <span className="hc-badge">Escolha uma para gerar o acesso</span>
      </div>

      <div className="relative mt-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cirurgia… (ex.: hérnia, vesícula, varizes)"
          className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 pl-11 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hc-ink-soft)]">🔎</span>
      </div>

      <p className="mt-3 text-xs text-[var(--hc-ink-soft)]">
        {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
      </p>

      <ul className="hc-scroll mt-2 max-h-[28rem] divide-y divide-[var(--hc-line)] overflow-y-auto">
        {filtrados.map((p) => (
          <LinhaProcedimento
            key={p.codigo}
            p={p}
            aberto={aberto === p.codigo}
            onToggle={() => setAberto(aberto === p.codigo ? null : p.codigo)}
            onUsar={onUsar}
          />
        ))}
      </ul>
    </div>
  );
}

function LinhaProcedimento({
  p,
  aberto,
  onToggle,
  onUsar,
}: {
  p: Procedimento;
  aberto: boolean;
  onToggle: () => void;
  onUsar?: (p: Procedimento) => void;
}) {
  const c = p.componentesCentavos;
  const componentes: [string, number][] = [
    ["Cirurgião", c.cirurgiao],
    ["1º Auxiliar", c.auxiliar1],
    ["2º Auxiliar", c.auxiliar2],
    ["Anestesista", c.anestesista],
    ["Pediatra", c.pediatra],
    ["Ex. RN / Vídeo", c.exRnVideo],
    ["Taxa / Sala", c.taxaSala],
  ];
  return (
    <li>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-[var(--hc-cream-2)]/60"
      >
        <span className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--hc-gold-deep)]">{p.codigo}</span>
          <span className="font-medium text-[var(--hc-ink)]">{p.nome}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="font-semibold text-[var(--hc-red-600)]">{brl(p.valorTotalCentavos)}</span>
          <span className={`text-[var(--hc-ink-soft)] transition-transform ${aberto ? "rotate-180" : ""}`}>⌄</span>
        </span>
      </button>
      {aberto && (
        <div className="pb-4 pl-12 pr-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            {componentes
              .filter(([, v]) => v > 0)
              .map(([label, v]) => (
                <div key={label} className="flex justify-between border-b border-dashed border-[var(--hc-line)] py-1">
                  <span className="text-[var(--hc-ink-soft)]">{label}</span>
                  <span className="text-[var(--hc-ink)]">{brl(v)}</span>
                </div>
              ))}
          </div>
          {onUsar && (
            <button
              onClick={() => onUsar(p)}
              className="hc-btn hc-btn-primary mt-4 w-full sm:w-auto"
            >
              Usar esta cirurgia e gerar acesso do paciente ↑
            </button>
          )}
        </div>
      )}
    </li>
  );
}
