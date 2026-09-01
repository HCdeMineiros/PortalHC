"use client";

import { useState } from "react";

async function token() {
  const { criarClienteBrowser } = await import("@/lib/supabase/client");
  const { data } = await criarClienteBrowser().auth.getSession();
  return data.session?.access_token;
}

export function PainelAssinafy() {
  const [saida, setSaida] = useState<string>("");
  const [ocupado, setOcupado] = useState("");

  async function chamar(caminho: string, metodo: "GET" | "POST") {
    setOcupado(caminho);
    setSaida("");
    try {
      const t = await token();
      const resp = await fetch(caminho, {
        method: metodo,
        headers: { Authorization: `Bearer ${t}`, ...(metodo === "POST" ? { "Content-Type": "application/json" } : {}) },
        body: metodo === "POST" ? JSON.stringify({}) : undefined,
      });
      const json = await resp.json();
      setSaida(JSON.stringify(json, null, 2));
    } catch {
      setSaida("Erro de conexão.");
    } finally {
      setOcupado("");
    }
  }

  return (
    <div className="hc-card-elevated hc-gold-frame p-6 sm:p-8">
      <span className="hc-badge">Integração · Assinafy</span>
      <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--hc-ink)]">Assinatura eletrônica (Assinafy)</h2>
      <p className="mt-1 text-sm text-[var(--hc-ink-soft)]">
        Após definir as variáveis na Vercel (API key, account id e token do webhook), use os botões para
        testar a conexão e registrar o webhook.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => chamar("/api/admin/assinafy/diagnostico", "GET")}
          disabled={!!ocupado}
          className="hc-btn hc-btn-ghost"
        >
          {ocupado.includes("diagnostico") ? "Testando…" : "Testar conexão"}
        </button>
        <button
          onClick={() => chamar("/api/admin/assinafy/registrar-webhook", "POST")}
          disabled={!!ocupado}
          className="hc-btn hc-btn-primary"
        >
          {ocupado.includes("registrar") ? "Registrando…" : "Registrar webhook"}
        </button>
      </div>

      {saida && (
        <pre className="mt-5 max-h-80 overflow-auto rounded-xl border border-[var(--hc-line)] bg-[var(--hc-cream)] p-4 text-xs text-[var(--hc-ink)]">
          {saida}
        </pre>
      )}
    </div>
  );
}
