"use client";

import { useEffect, useMemo, useState } from "react";

/** Preenchimento vindo do catálogo (escolher uma cirurgia já ativa). */
export interface PreCirurgia {
  nome: string;
  cirurgiaoStr: string;
  anestesistaStr: string;
  token: number;
}

/**
 * Cadastro de cirurgia pelo médico — salva no banco e gera o código de acesso.
 * Auxiliar = 30% do cirurgião · Hospital = 60% do cirurgião (recalculado no servidor).
 */
const AUXILIAR_PCT = 0.3;
const HOSPITAL_PCT = 0.6;

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function paraCentavos(v: string): number {
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function mascararCpf(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

interface CirurgiaCadastrada {
  numero: string;
  nome: string;
  pacienteNome: string;
  codigoAcesso: string;
  total: number;
}

export function CadastrarCirurgia({ pre }: { pre?: PreCirurgia | null }) {
  const [nome, setNome] = useState("");
  const [cirurgiaoStr, setCirurgiaoStr] = useState("");
  const [anestesistaStr, setAnestesistaStr] = useState("");
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteCpf, setPacienteCpf] = useState("");
  const [pacienteNascimento, setPacienteNascimento] = useState("");
  const [pacienteFicha, setPacienteFicha] = useState("");
  const [pacienteWhats, setPacienteWhats] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastradas, setCadastradas] = useState<CirurgiaCadastrada[]>([]);

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
    return { auxiliar, hospital, total: cirurgiao + anestesista + auxiliar + hospital };
  }, [cirurgiao, anestesista]);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpfDigitos = pacienteCpf.replace(/\D/g, "");
    if (!nome.trim()) return setErro("Informe o nome da cirurgia.");
    if (cirurgiao <= 0) return setErro("Informe o valor do cirurgião.");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente.");
    if (cpfDigitos.length !== 11) return setErro("Informe o CPF do paciente (11 dígitos).");
    if (!pacienteNascimento) return setErro("Informe a data de nascimento do paciente.");
    if (!pacienteFicha.trim()) return setErro("Informe o número da ficha do paciente.");

    setEnviando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setErro("Sessão expirada. Faça login novamente.");
        return;
      }
      const resp = await fetch("/api/medico/cadastrar-cirurgia", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome: nome.trim(),
          cirurgiaoCentavos: cirurgiao,
          anestesistaCentavos: anestesista,
          pacienteNome: pacienteNome.trim(),
          pacienteCpf: cpfDigitos,
          pacienteNascimento,
          pacienteFicha: pacienteFicha.trim(),
          pacienteWhatsapp: pacienteWhats.trim(),
        }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setErro(json?.erro || "Falha ao cadastrar.");
        return;
      }
      setCadastradas((prev) => [
        {
          numero: json.numero,
          nome: nome.trim(),
          pacienteNome: pacienteNome.trim(),
          codigoAcesso: json.codigo,
          total: json.total_centavos ?? calc.total,
        },
        ...prev,
      ]);
      setNome("");
      setCirurgiaoStr("");
      setAnestesistaStr("");
      setPacienteNome("");
      setPacienteCpf("");
      setPacienteNascimento("");
      setPacienteFicha("");
      setPacienteWhats("");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Somente o médico</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">
        Cadastrar cirurgia
      </h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Informe o valor do cirurgião e do anestesista. O <strong>auxiliar (30%)</strong> e o{" "}
        <strong>hospital (60%)</strong> são calculados automaticamente.
      </p>

      <form onSubmit={cadastrar} className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Campo label="Nome da cirurgia">
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Colecistectomia videolaparoscópica" className={inputCls} />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Valor do cirurgião (R$)">
              <input inputMode="decimal" value={cirurgiaoStr} onChange={(e) => setCirurgiaoStr(e.target.value)} placeholder="0,00" className={inputCls} />
            </Campo>
            <Campo label="Valor do anestesista (R$)">
              <input inputMode="decimal" value={anestesistaStr} onChange={(e) => setAnestesistaStr(e.target.value)} placeholder="0,00" className={inputCls} />
            </Campo>
          </div>

          <div className="border-t border-[var(--hc-line)] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">
              Paciente que receberá o acesso
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nome do paciente">
                <input value={pacienteNome} onChange={(e) => setPacienteNome(e.target.value)} placeholder="Nome completo" className={inputCls} />
              </Campo>
              <Campo label="CPF">
                <input inputMode="numeric" value={pacienteCpf} onChange={(e) => setPacienteCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
              </Campo>
              <Campo label="Data de nascimento">
                <input type="date" value={pacienteNascimento} onChange={(e) => setPacienteNascimento(e.target.value)} className={inputCls} />
              </Campo>
              <Campo label="Nº da ficha (PROMÉDICO)">
                <input value={pacienteFicha} onChange={(e) => setPacienteFicha(e.target.value)} placeholder="Ex.: 170245" className={inputCls} />
              </Campo>
              <Campo label="WhatsApp">
                <input value={pacienteWhats} onChange={(e) => setPacienteWhats(e.target.value)} placeholder="(64) 9xxxx-xxxx" className={inputCls} />
              </Campo>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
          <p className="mb-3 text-sm font-semibold text-[var(--hc-ink)]">Composição do valor</p>
          <Linha rotulo="Cirurgião" valor={brl(cirurgiao)} destaque />
          <Linha rotulo="Anestesista" valor={brl(anestesista)} destaque />
          <Linha rotulo="Auxiliar (30% do cirurgião)" valor={brl(calc.auxiliar)} auto />
          <Linha rotulo="Hospital · taxa/sala (60% do cirurgião)" valor={brl(calc.hospital)} auto />
          <div className="mt-3 flex items-center justify-between border-t border-[var(--hc-line)] pt-3">
            <span className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Total</span>
            <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">{brl(calc.total)}</span>
          </div>

          {erro && <p className="mt-3 text-sm text-[var(--hc-red-600)]">{erro}</p>}
          <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary mt-4 w-full">
            {enviando ? "Salvando…" : "Cadastrar e gerar acesso do paciente"}
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--hc-ink-soft)]">
            O paciente entra com CPF + data de nascimento + o código gerado abaixo.
          </p>
        </div>
      </form>

      {cadastradas.length > 0 && (
        <div className="mt-8 border-t border-[var(--hc-line)] pt-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">
            Cirurgias cadastradas nesta sessão ({cadastradas.length})
          </h3>
          <ul className="mt-3 space-y-3">
            {cadastradas.map((c) => (
              <li key={c.numero} className="hc-card hc-gold-frame flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-[var(--hc-ink)]">{c.nome}</p>
                  <p className="text-sm text-[var(--hc-ink-soft)]">
                    {c.pacienteNome} · Solicitação <strong className="text-[var(--hc-ink)]">{c.numero}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Código de acesso do paciente</p>
                  <p className="font-mono text-2xl font-bold tracking-[0.3em] text-[var(--hc-gold-deep)]">{c.codigoAcesso}</p>
                  <p className="text-sm font-semibold text-[var(--hc-red-600)]">{brl(c.total)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--hc-ink-soft)]">
            🔒 Anote o código e repasse ao paciente (por enquanto manualmente; depois, automático por WhatsApp). Ele não é exibido novamente.
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

function Linha({ rotulo, valor, destaque, auto }: { rotulo: string; valor: string; destaque?: boolean; auto?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={auto ? "text-[var(--hc-gold-deep)]" : "text-[var(--hc-ink-soft)]"}>
        {rotulo} {auto && <span className="text-[10px] uppercase">auto</span>}
      </span>
      <span className={`${destaque ? "font-semibold" : ""} text-[var(--hc-ink)]`}>{valor}</span>
    </div>
  );
}
