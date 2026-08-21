"use client";

import { useState } from "react";

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

interface Cadastrada {
  numero: string;
  pacienteNome: string;
  codigoAcesso: string;
  whatsappEnviado: boolean;
}

export function CadastrarInternacao({ onCadastrar }: { onCadastrar?: () => void }) {
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteCpf, setPacienteCpf] = useState("");
  const [pacienteNascimento, setPacienteNascimento] = useState("");
  const [pacienteFicha, setPacienteFicha] = useState("");
  const [pacienteWhats, setPacienteWhats] = useState("");
  const [acomodacao, setAcomodacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastradas, setCadastradas] = useState<Cadastrada[]>([]);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpf = pacienteCpf.replace(/\D/g, "");
    if (!pacienteNome.trim()) return setErro("Informe o nome do paciente.");
    if (cpf.length !== 11) return setErro("Informe o CPF do paciente (11 dígitos).");
    if (!pacienteNascimento) return setErro("Informe a data de nascimento do paciente.");
    if (!pacienteFicha.trim()) return setErro("Informe o número da ficha do paciente.");
    if (!acomodacao) return setErro("Selecione a acomodação (Enfermaria, Apartamento ou Suíte).");

    setEnviando(true);
    try {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return setErro("Sessão expirada. Faça login novamente.");
      const resp = await fetch("/api/medico/cadastrar-internacao", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pacienteNome: pacienteNome.trim(),
          pacienteCpf: cpf,
          pacienteNascimento,
          pacienteFicha: pacienteFicha.trim(),
          pacienteWhatsapp: pacienteWhats.trim(),
          acomodacao,
        }),
      });
      const json = await resp.json();
      if (!resp.ok) return setErro(json?.erro || "Falha ao cadastrar.");
      setCadastradas((prev) => [{ numero: json.numero, pacienteNome: pacienteNome.trim(), codigoAcesso: json.codigo, whatsappEnviado: !!json.whatsapp_enviado }, ...prev]);
      setPacienteNome(""); setPacienteCpf(""); setPacienteNascimento(""); setPacienteFicha(""); setPacienteWhats("");
      setAcomodacao("");
      onCadastrar?.();
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
        Cadastrar internação clínica
      </h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Internação sem cirurgia. Selecione a <strong>acomodação</strong> — a equipe lança as
        diárias depois para gerar o valor.
      </p>

      <form onSubmit={cadastrar} className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Paciente</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Nome</span>
              <input value={pacienteNome} onChange={(e) => setPacienteNome(e.target.value)} placeholder="Nome completo" className={inputCls} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">CPF</span>
              <input inputMode="numeric" value={pacienteCpf} onChange={(e) => setPacienteCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Data de nascimento</span>
              <input type="date" value={pacienteNascimento} onChange={(e) => setPacienteNascimento(e.target.value)} className={inputCls} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Nº da ficha (PROMÉDICO)</span>
              <input value={pacienteFicha} onChange={(e) => setPacienteFicha(e.target.value)} placeholder="Ex.: 170245" className={inputCls} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">WhatsApp</span>
              <input value={pacienteWhats} onChange={(e) => setPacienteWhats(e.target.value)} placeholder="(64) 9xxxx-xxxx" className={inputCls} /></label>
          </div>
        </div>

        <div className="border-t border-[var(--hc-line)] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--hc-gold-deep)]">Acomodação</p>
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

        {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
        <button type="submit" disabled={enviando} className="hc-btn hc-btn-primary w-full sm:w-auto">
          {enviando ? "Salvando…" : "Cadastrar internação e gerar acesso do paciente"}
        </button>
      </form>

      {cadastradas.length > 0 && (
        <div className="mt-8 border-t border-[var(--hc-line)] pt-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">Internações cadastradas ({cadastradas.length})</h3>
          <ul className="mt-3 space-y-3">
            {cadastradas.map((c) => (
              <li key={c.numero} className="hc-card hc-gold-frame flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-[var(--hc-ink)]">Internação clínica</p>
                  <p className="text-sm text-[var(--hc-ink-soft)]">{c.pacienteNome} · Sol. <strong className="text-[var(--hc-ink)]">{c.numero}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--hc-ink-soft)]">Código de acesso do paciente</p>
                  <p className="font-mono text-2xl font-bold tracking-[0.3em] text-[var(--hc-gold-deep)]">{c.codigoAcesso}</p>
                  {c.whatsappEnviado ? (
                    <p className="text-xs font-medium text-emerald-600">✓ Enviado ao WhatsApp</p>
                  ) : (
                    <p className="text-xs text-[var(--hc-ink-soft)]">Anote e repasse</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
