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

  const intro = (titulo: string, sub: string) => (
    <section className="hc-fade-up text-center">
      <span className="hc-badge">Acesso da Equipe</span>
      <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--hc-ink)] sm:text-5xl">{titulo}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--hc-ink-soft)]">{sub}</p>
    </section>
  );

  if (papel === "faturamento") {
    return (
      <div className="space-y-8">
        {intro("Faturamento", "Atendimentos finalizados e baixados, com impressão por período.")}
        <PainelFaturamento />
      </div>
    );
  }

  if (papel === "admin_dpo") {
    return (
      <div className="space-y-8">
        {intro("Internação & Faturamento", "Cadastros e acomodação, e os atendimentos finalizados no faturamento.")}
        <SecaoCadastros />
        <ListaCirurgias />
        <PainelFaturamento />
      </div>
    );
  }

  // Internação (padrão da equipe): atendimentos em aberto
  return (
    <div className="space-y-8">
      {intro("Internação", "Cadastre, lance a acomodação e finalize; o finalizado vai para o Faturamento.")}
      <SecaoCadastros />
      <ListaCirurgias />
    </div>
  );
}
