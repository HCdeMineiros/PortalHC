"use client";

import { useEffect, useState } from "react";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { SecaoCadastros } from "./SecaoCadastros";
import { ListaCirurgias } from "./ListaCirurgias";
import { PainelFaturamento } from "./PainelFaturamento";

/**
 * Conteúdo da área da equipe conforme o setor (papel) de quem entrou:
 * - Internação → cadastros + lista de atendimentos
 * - Faturamento → finalizados/baixados
 * - Admin/DPO → ambos
 * O direcionamento é feito no login (tela de setores), sem abas aqui.
 */
export function PainelEquipe() {
  const [papel, setPapel] = useState<string | null>(SUPABASE_CONFIGURADO ? null : "internacao");

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

  if (papel === null) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hc-line)] border-t-[var(--hc-red-600)]" />
        <p className="text-sm text-[var(--hc-ink-soft)]">Carregando…</p>
      </div>
    );
  }

  if (papel === "faturamento") {
    return <PainelFaturamento />;
  }

  if (papel === "admin_dpo") {
    return (
      <div className="space-y-8">
        <SecaoCadastros />
        <ListaCirurgias />
        <PainelFaturamento />
      </div>
    );
  }

  // Internação (padrão da equipe): atendimentos
  return (
    <div className="space-y-8">
      <SecaoCadastros />
      <ListaCirurgias />
    </div>
  );
}
