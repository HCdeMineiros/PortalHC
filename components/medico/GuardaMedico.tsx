"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

/**
 * Protege a Área do Médico no cliente. Como a sessão é só em memória,
 * qualquer F5 / nova visita começa SEM sessão → redireciona para o login.
 * Em modo demonstração (sem Supabase) libera o acesso.
 */
export function GuardaMedico({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(!SUPABASE_CONFIGURADO);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const { data } = await criarClienteBrowser().auth.getSession();
      if (!ativo) return;
      if (data.session) setOk(true);
      else router.replace("/medico/login");
    })();
    return () => {
      ativo = false;
    };
  }, [router]);

  if (ok) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hc-line)] border-t-[var(--hc-red-600)]" />
      <p className="text-sm text-[var(--hc-ink-soft)]">Verificando acesso…</p>
    </div>
  );
}
