"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { SignaturePad } from "@/components/ui/SignaturePad";

const brl = (c: number) => ((c ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function mascararCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

interface Doc {
  chave: string;
  tipo: "termo_consentimento" | "documento_informativo";
  titulo: string;
  subtitulo: string;
  corpo: string[];
  exigeAssinatura: boolean;
}
interface Solicitacao {
  numero: string;
  tipo: string;
  status: string;
  procedimento_nome: string | null;
  valor_total_centavos: number | null;
  acomodacao: string | null;
  acomodacao_dias: number | null;
  acomodacao_total_centavos: number | null;
  total_geral_centavos: number;
  medicos: { nome: string } | null;
}

export default function AcessoPaciente() {
  const [fase, setFase] = useState<"identificacao" | "painel">("identificacao");
  const [cpf, setCpf] = useState("");
  const [ficha, setFicha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const [pacienteNome, setPacienteNome] = useState("");
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [documentos, setDocumentos] = useState<Doc[]>([]);
  const [feitos, setFeitos] = useState<Set<string>>(new Set());
  const [aberto, setAberto] = useState<Doc | null>(null);

  async function acessar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cpfD = cpf.replace(/\D/g, "");
    if (cpfD.length !== 11 || !ficha.trim() || !codigo.trim())
      return setErro("Preencha CPF, ficha e código.");
    setEntrando(true);
    try {
      const resp = await fetch("/api/paciente/acessar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfD, ficha: ficha.trim(), codigo: codigo.trim() }),
      });
      const json = await resp.json();
      if (!resp.ok) return setErro(json?.erro || "Falha ao acessar.");
      setPacienteNome(json.paciente.nome);
      setSolicitacao(json.solicitacao);
      setDocumentos(json.documentos ?? []);
      setFeitos(new Set(json.aceites ?? []));
      setFase("painel");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEntrando(false);
    }
  }

  async function confirmarDoc(doc: Doc, nome: string, assinatura: string | null) {
    const resp = await fetch("/api/paciente/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpf: cpf.replace(/\D/g, ""),
        ficha: ficha.trim(),
        codigo: codigo.trim(),
        chave: doc.chave,
        tipo: doc.exigeAssinatura ? "assinatura" : "ok",
        nome,
        assinaturaDataUrl: assinatura,
      }),
    });
    if (!resp.ok) {
      const j = await resp.json();
      throw new Error(j?.erro || "Falha ao registrar.");
    }
    setFeitos((prev) => new Set(prev).add(doc.chave));
    setAberto(null);
  }

  const total = documentos.length;
  const concluidos = documentos.filter((d) => feitos.has(d.chave)).length;
  const tudo = total > 0 && concluidos === total;
  const inputCls =
    "w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-3 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]";

  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={62} /></Link>
      </header>

      {fase === "identificacao" ? (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
          <div className="hc-card hc-gold-frame hc-fade-up p-8">
            <span className="hc-badge">Acesso do paciente</span>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-[var(--hc-ink)]">Meus documentos</h1>
            <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
              Informe seu CPF, o nº da ficha e o código que você recebeu.
            </p>
            <form onSubmit={acessar} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">CPF</label>
                <input inputMode="numeric" value={cpf} onChange={(e) => setCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Nº da ficha (PROMÉDICO)</label>
                <input value={ficha} onChange={(e) => setFicha(e.target.value)} placeholder="Ex.: 170245" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Código de acesso</label>
                <input inputMode="numeric" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" className={`${inputCls} text-center text-2xl tracking-[0.4em]`} />
              </div>
              {erro && <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>}
              <button type="submit" disabled={entrando} className="hc-btn hc-btn-primary w-full">
                {entrando ? "Entrando…" : "Acessar meus documentos"}
              </button>
            </form>
          </div>
          <p className="mt-5 text-center text-xs text-[var(--hc-ink-soft)]">🔒 Seus dados trafegam com segurança e você vê apenas o seu procedimento.</p>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
          <section className="hc-card hc-fade-up p-6 sm:p-8">
            <span className="hc-badge">{solicitacao?.tipo === "internacao_clinica" ? "Internação prevista" : "Procedimento previsto"}</span>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--hc-ink)]">Olá, {pacienteNome.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-[var(--hc-ink-soft)]">Leia com calma e conclua cada documento.</p>
            <dl className="mt-5 grid gap-4 border-t border-[var(--hc-line)] pt-5 sm:grid-cols-3">
              <div><dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Procedimento</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">{solicitacao?.procedimento_nome}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Médico</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">{solicitacao?.medicos?.nome || "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Solicitação</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">{solicitacao?.numero}</dd></div>
            </dl>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--hc-gold)]/40 bg-[color-mix(in_srgb,var(--hc-gold)_9%,white)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--hc-ink)]">Valor total</span>
              <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">
                {(solicitacao?.total_geral_centavos ?? 0) > 0 ? brl(solicitacao!.total_geral_centavos) : "A definir"}
              </span>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--hc-ink)]">Seu progresso</span>
              <span className="text-[var(--hc-ink-soft)]">{concluidos} de {total} concluídos</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--hc-cream-2)]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--hc-red)] to-[var(--hc-red-700)] transition-all duration-500" style={{ width: `${total ? (concluidos / total) * 100 : 0}%` }} />
            </div>
          </section>

          {tudo ? (
            <section className="hc-card hc-gold-frame hc-fade-up mt-6 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
              <h2 className="font-serif text-3xl font-semibold text-[var(--hc-ink)]">Tudo concluído!</h2>
              <p className="mx-auto mt-2 max-w-md text-[var(--hc-ink-soft)]">
                Você concluiu todos os documentos. A equipe já pode liberar sua admissão.
              </p>
            </section>
          ) : (
            <section className="mt-6 space-y-4">
              {documentos.map((d) => {
                const feito = feitos.has(d.chave);
                return (
                  <div key={d.chave} className={`hc-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${feito ? "opacity-80" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${feito ? "bg-emerald-50 text-emerald-600" : "bg-[var(--hc-red-050)] text-[var(--hc-red-600)]"}`}>
                        {feito ? "✓" : d.exigeAssinatura ? "✍️" : "📄"}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">{d.titulo}</h3>
                          <span className="hc-badge">{d.exigeAssinatura ? "Requer assinatura" : "Requer ciência"}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--hc-ink-soft)]">{d.subtitulo}</p>
                      </div>
                    </div>
                    <div className="flex-none">
                      {feito ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">✓ {d.exigeAssinatura ? "Assinado" : "Ciente"}</span>
                      ) : (
                        <button onClick={() => setAberto(d)} className="hc-btn hc-btn-primary w-full sm:w-auto">
                          {d.exigeAssinatura ? "Ler e assinar" : "Ler e dar OK"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      )}

      {aberto && <Leitor doc={aberto} nomePaciente={pacienteNome} onFechar={() => setAberto(null)} onConfirmar={confirmarDoc} />}

      <Rodape />
    </>
  );
}

function Leitor({
  doc,
  nomePaciente,
  onFechar,
  onConfirmar,
}: {
  doc: Doc;
  nomePaciente: string;
  onFechar: () => void;
  onConfirmar: (doc: Doc, nome: string, assinatura: string | null) => Promise<void>;
}) {
  const precisaAssinar = doc.exigeAssinatura;
  const [aceito, setAceito] = useState(false);
  const [nome, setNome] = useState("");
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [leuFim, setLeuFim] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const pode = precisaAssinar ? aceito && nome.trim().length > 3 && leuFim : aceito && leuFim;

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setLeuFim(true);
  }
  async function confirmar() {
    setErro("");
    setEnviando(true);
    try {
      await onConfirmar(doc, nome.trim(), assinatura);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,22,22,.55)] p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="hc-card-elevated flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hc-line)] p-5">
          <div>
            <span className="hc-badge">{precisaAssinar ? "Termo de consentimento" : "Documento informativo"}</span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--hc-ink)]">{doc.titulo}</h2>
            <p className="text-sm text-[var(--hc-ink-soft)]">{doc.subtitulo}</p>
          </div>
          <button onClick={onFechar} className="rounded-full p-2 text-[var(--hc-ink-soft)] hover:bg-[var(--hc-cream-2)]" aria-label="Fechar">✕</button>
        </div>

        <div onScroll={onScroll} className="hc-scroll hc-prose flex-1 overflow-y-auto px-6 py-5">
          {doc.corpo.map((p, i) => <p key={i}>{p}</p>)}
          {!leuFim && <p className="mt-4 text-center text-xs italic text-[var(--hc-gold-deep)]">↓ Role até o fim para habilitar a confirmação</p>}
        </div>

        <div className="border-t border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
          {precisaAssinar && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Digite seu nome completo</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={nomePaciente} className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Assinatura (opcional)</label>
                <SignaturePad onChange={setAssinatura} />
              </div>
            </div>
          )}
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="hc-check mt-0.5" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
            <span className="text-sm text-[var(--hc-ink)]">
              {precisaAssinar ? "Li e concordo integralmente com este termo, de forma livre e esclarecida." : "Li e estou ciente das informações deste documento."}
            </span>
          </label>
          {erro && <p className="mt-2 text-sm text-[var(--hc-red-600)]">{erro}</p>}
          <button disabled={!pode || enviando} onClick={confirmar} className="hc-btn hc-btn-primary mt-4 w-full">
            {enviando ? "Registrando…" : precisaAssinar ? "Assinar eletronicamente" : "Confirmar ciência (OK)"}
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--hc-ink-soft)]">
            🔒 Registramos data/hora, IP e dispositivo como evidência (Lei 14.063/2020). A assinatura qualificada via Assinafy será ativada em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
