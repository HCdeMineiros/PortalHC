"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Rodape } from "@/components/brand/Rodape";
import { FundoSuave } from "@/components/brand/FundoSuave";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { SOLICITACAO_DEMO, type ItemDocumento } from "@/lib/mock/data";

export default function PainelPaciente() {
  const s = SOLICITACAO_DEMO;
  const [itens, setItens] = useState<ItemDocumento[]>(s.itens);
  const [abertoId, setAbertoId] = useState<string | null>(null);

  const concluidos = itens.filter((i) => i.status !== "pendente").length;
  const total = itens.length;
  const tudoPronto = concluidos === total;
  const protocolo = useMemo(
    () => `${s.numero}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    [s.numero],
  );

  const aberto = itens.find((i) => i.id === abertoId) ?? null;

  function concluirItem(id: string, novoStatus: "assinado" | "ok_dado") {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: novoStatus } : i)),
    );
    setAbertoId(null);
  }

  return (
    <>
      <FundoSuave />
      <div className="hc-gold-rule" />
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={62} /></Link>
        <span className="text-sm text-[var(--hc-ink-soft)]">Solicitação <strong className="text-[var(--hc-ink)]">{s.numero}</strong></span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-16">
        {/* Resumo do paciente */}
        <section className="hc-card hc-fade-up p-6 sm:p-8">
          <span className="hc-badge">Internação prevista</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--hc-ink)]">
            Olá, {s.paciente.nome.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-[var(--hc-ink-soft)]">
            Estes são os documentos do seu procedimento. Leia com calma e conclua cada item.
          </p>
          <dl className="mt-5 grid gap-4 border-t border-[var(--hc-line)] pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Procedimento</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">{s.procedimento}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Médico</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">{s.medico}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Data prevista</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hc-ink)]">
                {new Date(s.dataPrevista + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--hc-gold)]/40 bg-[color-mix(in_srgb,var(--hc-gold)_9%,white)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--hc-ink)]">Valor total do procedimento (particular)</span>
            <span className="font-serif text-2xl font-semibold text-[var(--hc-red-600)]">{s.valorTotal}</span>
          </div>
        </section>

        {/* Progresso */}
        <section className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--hc-ink)]">Seu progresso</span>
            <span className="text-[var(--hc-ink-soft)]">{concluidos} de {total} concluídos</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--hc-cream-2)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--hc-red)] to-[var(--hc-red-700)] transition-all duration-500"
              style={{ width: `${(concluidos / total) * 100}%` }}
            />
          </div>
        </section>

        {/* Lista de documentos */}
        {!tudoPronto ? (
          <section className="mt-6 space-y-4">
            {itens.map((item) => (
              <DocumentoCard key={item.id} item={item} onAbrir={() => setAbertoId(item.id)} />
            ))}
          </section>
        ) : (
          <ConclusaoTudo protocolo={protocolo} />
        )}
      </main>

      {aberto && (
        <LeitorDocumento
          item={aberto}
          nomePaciente={s.paciente.nome}
          onFechar={() => setAbertoId(null)}
          onConcluir={concluirItem}
        />
      )}

      <Rodape />
    </>
  );
}

function DocumentoCard({ item, onAbrir }: { item: ItemDocumento; onAbrir: () => void }) {
  const precisaAssinar = item.tipo === "termo_consentimento";
  const feito = item.status !== "pendente";
  return (
    <div className={`hc-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${feito ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${feito ? "bg-emerald-50 text-emerald-600" : "bg-[var(--hc-red-050)] text-[var(--hc-red-600)]"}`}>
          {feito ? "✓" : precisaAssinar ? "✍️" : "📄"}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-[var(--hc-ink)]">{item.titulo}</h3>
            <span className={`hc-badge ${precisaAssinar ? "" : "!text-[var(--hc-ink-soft)]"}`}>
              {precisaAssinar ? "Requer assinatura" : "Requer ciência"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[var(--hc-ink-soft)]">{item.subtitulo} · {item.versao}</p>
        </div>
      </div>
      <div className="flex-none">
        {feito ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            ✓ {precisaAssinar ? "Assinado" : "Ciente"}
          </span>
        ) : (
          <button onClick={onAbrir} className="hc-btn hc-btn-primary w-full sm:w-auto">
            {precisaAssinar ? "Ler e assinar" : "Ler e dar OK"}
          </button>
        )}
      </div>
    </div>
  );
}

function LeitorDocumento({
  item,
  nomePaciente,
  onFechar,
  onConcluir,
}: {
  item: ItemDocumento;
  nomePaciente: string;
  onFechar: () => void;
  onConcluir: (id: string, status: "assinado" | "ok_dado") => void;
}) {
  const precisaAssinar = item.tipo === "termo_consentimento";
  const [aceito, setAceito] = useState(false);
  const [nome, setNome] = useState("");
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [leuAteFim, setLeuAteFim] = useState(false);

  const podeConcluir = precisaAssinar
    ? aceito && nome.trim().length > 3 && leuAteFim
    : aceito && leuAteFim;

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setLeuAteFim(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,22,22,.55)] p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="hc-card-elevated flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-2xl">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hc-line)] p-5">
          <div>
            <span className="hc-badge">{precisaAssinar ? "Termo de consentimento" : "Documento informativo"}</span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--hc-ink)]">{item.titulo}</h2>
            <p className="text-sm text-[var(--hc-ink-soft)]">{item.subtitulo} · versão {item.versao}</p>
          </div>
          <button onClick={onFechar} className="rounded-full p-2 text-[var(--hc-ink-soft)] hover:bg-[var(--hc-cream-2)]" aria-label="Fechar">✕</button>
        </div>

        {/* Corpo (rolagem) */}
        <div onScroll={onScroll} className="hc-scroll hc-prose flex-1 overflow-y-auto px-6 py-5">
          {item.corpo.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {!leuAteFim && (
            <p className="mt-4 text-center text-xs italic text-[var(--hc-gold-deep)]">
              ↓ Role até o fim para habilitar a confirmação
            </p>
          )}
        </div>

        {/* Rodapé de aceite */}
        <div className="border-t border-[var(--hc-line)] bg-[var(--hc-cream)] p-5">
          {precisaAssinar && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--hc-ink)]">Digite seu nome completo</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={nomePaciente}
                  className="w-full rounded-xl border border-[var(--hc-line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--hc-gold)] focus:ring-2 focus:ring-[var(--hc-gold-soft)]"
                />
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
              {precisaAssinar
                ? "Li e concordo integralmente com este termo, de forma livre e esclarecida."
                : "Li e estou ciente das informações deste documento."}
            </span>
          </label>

          <button
            disabled={!podeConcluir}
            onClick={() => onConcluir(item.id, precisaAssinar ? "assinado" : "ok_dado")}
            className="hc-btn hc-btn-primary mt-4 w-full"
          >
            {precisaAssinar ? "Assinar eletronicamente" : "Confirmar ciência (OK)"}
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--hc-ink-soft)]">
            🔒 Registraremos data/hora do servidor, IP e dispositivo como evidência (Lei 14.063/2020).
            {assinatura ? " Assinatura desenhada capturada." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConclusaoTudo({ protocolo }: { protocolo: string }) {
  return (
    <section className="hc-card hc-gold-frame hc-fade-up mt-6 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
      <h2 className="font-serif text-3xl font-semibold text-[var(--hc-ink)]">Tudo concluído!</h2>
      <p className="mx-auto mt-2 max-w-md text-[var(--hc-ink-soft)]">
        Você leu e concluiu todos os documentos da sua internação. A equipe da Internação já pode
        liberar sua admissão. Você receberá o PDF assinado com a trilha de auditoria.
      </p>
      <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-xl border border-[var(--hc-line)] bg-white px-6 py-4">
        <span className="text-xs uppercase tracking-wide text-[var(--hc-ink-soft)]">Protocolo de verificação</span>
        <span className="mt-1 font-mono text-lg font-semibold text-[var(--hc-red-600)]">{protocolo}</span>
      </div>
      <p className="mt-6 text-xs text-[var(--hc-ink-soft)]">
        (Demonstração) No sistema final, geramos o PDF com página de trilha/QR e a verificação pública em /verificar.
      </p>
    </section>
  );
}
