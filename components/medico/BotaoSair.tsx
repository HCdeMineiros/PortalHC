"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

/** Mostra "Sair" apenas quando há sessão de colaborador ativa. */
export function BotaoSair() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data } = await supabase.auth.getUser();
      if (ativo) setEmail(data.user?.email ?? null);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  if (!email) return null;

  async function sair() {
    const { criarClienteBrowser } = await import("@/lib/supabase/client");
    await criarClienteBrowser().auth.signOut();
    router.push("/medico/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-[var(--hc-ink-soft)] sm:inline">{email}</span>
      <button onClick={sair} className="hc-btn hc-btn-ghost px-4 py-2">
        Sair
      </button>
    </div>
  );
}
