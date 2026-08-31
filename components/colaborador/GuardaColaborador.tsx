"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";
import { InatividadeLogout } from "@/components/brand/InatividadeLogout";

type Estado = "checando" | "ok" | "negado";
const PAPEIS_EQUIPE = ["internacao", "faturamento", "admin_dpo"];

/** Protege /colaborador: exige sessão + papel de equipe (internação/faturamento/admin). */
export function GuardaColaborador({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<Estado>(SUPABASE_CONFIGURADO ? "checando" : "ok");

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data: s } = await supabase.auth.getSession();
      if (!ativo) return;
      if (!s.session) {
        router.replace(`/medico/login?redir=${encodeURIComponent(pathname)}`);
        return;
      }
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("papel")
        .eq("id", s.session.user.id)
        .single();
      if (!ativo) return;
      setEstado(perfil && PAPEIS_EQUIPE.includes(perfil.papel) ? "ok" : "negado");
    })();
    return () => {
      ativo = false;
    };
  }, [router, pathname]);

  if (estado === "ok") return (<><InatividadeLogout />{children}</>);

  if (estado === "negado") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--hc-red-050)] text-2xl">🔒</div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--hc-ink)]">Acesso restrito</h1>
        <p className="text-sm text-[var(--hc-ink-soft)]">
          Esta área é da equipe (Internação/Faturamento). Sua conta não tem essa permissão.
        </p>
        <Link href="/" className="hc-btn hc-btn-ghost">← Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hc-line)] border-t-[var(--hc-red-600)]" />
      <p className="text-sm text-[var(--hc-ink-soft)]">Verificando acesso…</p>
    </div>
  );
}
