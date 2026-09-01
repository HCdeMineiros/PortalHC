"use client";

import { useState } from "react";

interface Aceite {
  tipo: string;
  carimbo_tempo: string | null;
  documento_hash: string | null;
}
interface DocAceite {
  chave: string;
  titulo: string;
  subtitulo: string;
  exigeAssinatura: boolean;
  aceite: Aceite | null;
}

async function token() {
  const { criarClienteBrowser } = await import("@/lib/supabase/client");
  const { data } = await criarClienteBrowser().auth.getSession();
  return data.session?.access_token;
}

const dataBr = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR") : "-");

export function Comprovantes({ solicitacaoId }: { solicitacaoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [docs, setDocs] = useState<DocAceite[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [baixando, setBaixando] = useState("");

  async function alternar() {
    if (aberto) return setAberto(false);
    setAberto(true);
    if (docs) return;
    setCarregando(true);
    setErro("");
    try {
      const t = await token();
      const resp = await fetch(`/api/colaborador/aceites?solicitacao=${solicitacaoId}`, { headers: { Authorization: `Bearer ${t}` } });
      const json = await resp.json();
      if (!resp.ok) setErro(json?.erro || "Falha ao carregar.");
      else setDocs(json.documentos ?? []);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  }

  async function baixar(chave: string) {
    setBaixando(chave);
    try {
      const t = await token();
      const resp = await fetch(`/api/colaborador/comprovante?solicitacao=${solicitacaoId}&doc=${encodeURIComponent(chave)}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        alert(j?.erro || "Falha ao gerar comprovante.");
        return;
      }
      const blob = await resp.blob();
      const u = URL.createObjectURL(blob);
      window.open(u, "_blank");
      setTimeout(() => URL.revokeObjectURL(u), 60000);
    } catch {
      alert("Erro ao gerar comprovante.");
    } finally {
      setBaixando("");
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={alternar}
        className="rounded-full border border-[var(--hc-line)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--hc-ink)] transition-colors hover:border-[var(--hc-gold)]"
      >
        📄 Comprovantes / evidências
      </button>

      {aberto && (
        <div className="mt-2 rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-3">
          {carregando ? (
            <p className="text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
          ) : erro ? (
            <p className="text-sm text-[var(--hc-red-600)]">{erro}</p>
          ) : docs && docs.length ? (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.chave} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hc-line)] pb-2 text-sm last:border-0 last:pb-0">
                  <span className="min-w-0">
                    <span className="block font-medium text-[var(--hc-ink)]">{d.titulo}</span>
                    <span className="block text-xs text-[var(--hc-ink-soft)]">
                      {d.aceite
                        ? `${d.aceite.tipo === "assinatura" ? "✓ Assinado" : "✓ Ciente"} em ${dataBr(d.aceite.carimbo_tempo)}`
                        : d.exigeAssinatura
                          ? "Aguardando assinatura"
                          : "Aguardando ciência"}
                    </span>
                  </span>
                  {d.aceite ? (
                    <button
                      onClick={() => baixar(d.chave)}
                      disabled={baixando === d.chave}
                      className="flex-none rounded-full bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {baixando === d.chave ? "Gerando…" : "Baixar comprovante"}
                    </button>
                  ) : (
                    <span className="flex-none text-xs text-[var(--hc-ink-soft)]">sem registro</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--hc-ink-soft)]">Nenhum documento para esta solicitação.</p>
          )}
        </div>
      )}
    </div>
  );
}
