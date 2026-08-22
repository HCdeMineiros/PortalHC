"use client";

import { useEffect, useState } from "react";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { SecaoCadastros } from "./SecaoCadastros";
import { ListaCirurgias } from "./ListaCirurgias";
import { PainelFaturamento } from "./PainelFaturamento";

type Aba = "atendimentos" | "faturamento";

export function PainelEquipe() {
  const [papel, setPapel] = useState("");
  const [aba, setAba] = useState<Aba>("atendimentos");

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data } = await supabase.auth.getUser();
      if (!ativo || !data.user) return;
      const { data: perfil } = await supabase.from("usuarios").select("papel").eq("id", data.user.id).single();
      if (ativo) setPapel(perfil?.papel ?? "");
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const podeFaturamento = papel === "faturamento" || papel === "admin_dpo";

  const botao = (chave: Aba, rotulo: string) => (
    <button
      onClick={() => setAba(chave)}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        aba === chave
          ? "bg-gradient-to-b from-[var(--hc-red)] to-[var(--hc-red-700)] text-white shadow-[0_8px_20px_-8px_rgba(160,12,34,.6)]"
          : "border border-[var(--hc-line)] bg-white text-[var(--hc-ink-soft)] hover:border-[var(--hc-gold)]"
      }`}
    >
      {rotulo}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        {botao("atendimentos", "Atendimentos")}
        {podeFaturamento && botao("faturamento", "Faturamento")}
      </div>

      {aba === "atendimentos" || !podeFaturamento ? (
        <div className="mt-6 space-y-8">
          <SecaoCadastros />
          <ListaCirurgias />
        </div>
      ) : (
        <div className="mt-6">
          <PainelFaturamento />
        </div>
      )}
    </div>
  );
}
