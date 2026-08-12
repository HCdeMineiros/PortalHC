"use client";

import { useEffect, useMemo, useState } from "react";

/** Preenchimento vindo do catálogo (escolher uma cirurgia já ativa). */
export interface PreCirurgia {
  nome: string;
  cirurgiaoStr: string;
  anestesistaStr: string;
  /** muda a cada seleção para disparar o preenchimento */
  token: number;
}

/**
 * Cadastro de nova cirurgia pelo médico.
 * O médico informa o valor do CIRURGIÃO e do ANESTESISTA;
 * AUXILIAR e HOSPITAL (taxa/sala) são calculados proporcionalmente.
 *
 * Regras definidas com o Dr. Denis:
 *   Auxiliar = 30% do cirurgião · Hospital = 60% do cirurgião
 */
const AUXILIAR_PCT = 0.3;
const HOSPITAL_PCT = 0.6;

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "1.234,56" | "1234.56" | "1234" → centavos */
function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

interface CirurgiaCadastrada {
  id: string;
  nome: string;
  pacienteNome: string;
  codigoAcesso: string;
  cirurgiao: number;
  anestesista: number;
  auxiliar: number;
  hospital: number;
  total: number;
}

export function CadastrarCirurgia({ pre }: { pre?: PreCirurgia | null }) {
  const [nome, setNome] = useState("");
  const [cirurgiaoStr, setCirurgiaoStr] = useState("");
  const [anestesistaStr, setAnestesistaStr] = useState("");
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteWhats, setPacienteWhats] = useState("");
  const [erro, setErro] = useState("");
  const [cadastradas, setCadastradas] = useState<CirurgiaCadastrada[]>([]);

  // preenche a partir de uma cirurgia escolhida no catálogo
  useEffect(() => {
    if (!pre || !pre.token) return;
    setNome(pre.nome);
    setCirurgiaoStr(pre.cirurgiaoStr);
    setAnestesistaStr(pre.anestesistaStr);
    setErro("");
  }, [pre]);

  const cirurgiao = paraCentavos(cirurgiaoStr);
  const anestesista = paraCentavos(anestesistaStr);

  const calc = useMemo(() => {
    const auxiliar = Math.round(cirurgiao * AUXILIAR_PCT);
    const hospital = Math.round(cirurgiao * HOSPITAL_PCT);
    const total = cirurgiao + anestesista + auxiliar + hospital;
    return { auxiliar, hospital, total };
  }, [cirurgiao, anestesista]);

  function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) return setErro("Informe o nome da cirurgia.");
    if (cirurgiao <= 0) return setErro("Informe o valor do cirurgião.");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente que receberá o acesso.");

    const codigoAcesso = String(Math.floor(100000 + Math.random() * 900000));
    setCadastradas((prev) => [
      {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        pacienteNome: pacienteNome.trim(),
        codigoAcesso,
        cirurgiao,
        anestesista,
        auxiliar: calc.auxiliar,
        hospital: calc.hospital,
        total: calc.total,
      },
      ...prev,
    ]);
    // limpa para o próximo cadastro
    setNome("");
    setCirurgiaoStr("");
    setAnestesistaStr("");
    setPacienteNome("");
    setPacienteWhats("");
  }

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Somente o médico</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">
        Cadastrar nova cirurgia
      </h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Informe o valor do cirurgião e do anestesista. O <strong>auxiliar (30%)</strong> e o{" "}
        <strong>hospital (60%)</strong> são calculados automaticamente.
      </p>

      <form onSubmit={cadastrar} className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Coluna 1 — entradas */}
        <div className="space-y-4">
          <Campo label="Nome da cirurgia">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Colecistectomia videolaparoscópica"
              className={inputCls}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Valor do cirurgião (R$)">
              <input
                inputMode="decimal"
                value={cirurgiaoStr}
                onChange={(e) => setCirurgiaoStr(e.target.value)}
                placeholder="0,00"
                className={inputCls}
              />
            </Campo>
            <Campo label="Valor do anestesista (R$)">
              <input
                inputMode="decimal"
                value={anestesistaStr}
                onChange={(e) => setAnestesistaStr(e.target.value)}
                placeholder="0,00"
                className={inputCls}
              />
            </Campo>
          </div>

          <div className="border-t border-[var(--hc-line)] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">
              Paciente que receberá o acesso
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nome do paciente">
                <input
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  placeholder="Nome completo"
                  className={inputCls}
                />
              </Campo>
              <Campo label="WhatsApp">
                <input
                  value={pacienteWhats}
                  onChange={(e) => setPacienteWhats(e.target.value)}
                  placeholder="(64) 9xxxx-xxxx"
                  className={inputCls}
                />
              </Campo>
            </div>
          </div>
        </div>

        {/* Coluna 2 — cálculo ao vivo */}
        <div className="rounded-2xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
          <p className="mb-3 text-sm font-semibold text-[var(--hc-ink)]">Composição do valor</p>
          <Linha rotulo="Cirurgião" valor={brl(cirurgiao)} destaque />
          <Linha rotulo="Anestesista" valor={brl(anestesista)} destaque />
          <Linha rotulo="Auxiliar (30% do cirurgião)" valor={brl(calc.auxiliar)} auto />
          <Linha rotulo="Hospital · taxa/sala (60% do cirurgião)" valor={brl(calc.hospital)} auto />
          <div className="mt-3 flex items-center justify-between border-t border-[var(--hc-line)] pt-3">
            <span className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Total</span>
            <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">
              {brl(calc.total)}
            </span>
          </div>

          {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}
          <button type="submit" className="hc-btn hc-btn-primary mt-4 w-full">
            Cadastrar e gerar acesso do paciente
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--hc-ink-soft)]">
            O paciente receberá o link e a senha (código) por WhatsApp para ler e assinar os termos.
          </p>
        </div>
      </form>

      {/* Cirurgias cadastradas nesta sessão */}
      {cadastradas.length > 0 && (
        <div className="mt-8 border-t border-[var(--hc-line)] pt-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
            Cirurgias cadastradas ({cadastradas.length})
          </h3>
          <ul className="mt-3 space-y-3">
            {cadastradas.map((c) => (
              <li key={c.id} className="hc-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-[var(--hc-ink)]">{c.nome}</p>
                  <p className="text-sm text-[var(--hc-ink-soft)]">
                    Paciente: {c.pacienteNome} · acesso:{" "}
                    <strong className="tracking-widest text-[var(--hc-gold-deep)]">{c.codigoAcesso}</strong>
                  </p>
                </div>
                <span className="font-serif text-xl font-semibold text-[var(--hc-red-600)]">
                  {brl(c.total)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--hc-ink-soft)]">
            (Demonstração) A persistência e o acesso real do paciente por senha serão ativados na
            integração com o banco de dados (Supabase).
          </p>
        </div>
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

function Linha({
  rotulo,
  valor,
  destaque,
  auto,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
  auto?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={auto ? "text-[var(--hc-gold-deep)]" : "text-[var(--hc-ink-soft)]"}>
        {rotulo} {auto && <span className="text-[10px] uppercase">auto</span>}
      </span>
      <span className={`${destaque ? "font-semibold" : ""} text-[var(--hc-ink)]`}>{valor}</span>
    </div>
  );
}
