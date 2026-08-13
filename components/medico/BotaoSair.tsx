"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

/**
 * Menu do colaborador logado: mostra o e-mail, o link de Administração
 * (só para admin_dpo) e o botão Sair. Os links são client-side, então
 * a sessão (em memória) se mantém ao navegar entre as áreas.
 */
const LINK = "rounded-full border border-[color-mix(in_srgb,var(--hc-gold)_55%,white)] bg-white px-4 py-2 font-medium text-[var(--hc-gold-deep)] hover:border-[var(--hc-gold)]";

export function BotaoSair() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [papel, setPapel] = useState<string>("");

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let ativo = true;
    (async () => {
      const { criarClienteBrowser } = await import("@/lib/supabase/client");
      const supabase = criarClienteBrowser();
      const { data } = await supabase.auth.getUser();
      if (!ativo || !data.user) return;
      setEmail(data.user.email ?? null);
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("papel")
        .eq("id", data.user.id)
        .single();
      if (ativo) setPapel(perfil?.papel ?? "");
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const ehAdmin = papel === "admin_dpo";
  const ehEquipe = ["internacao", "faturamento", "admin_dpo"].includes(papel);

  if (!email) return null;

  async function sair() {
    const { criarClienteBrowser } = await import("@/lib/supabase/client");
    await criarClienteBrowser().auth.signOut();
    router.push("/medico/login");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {ehAdmin && <Link href="/admin" className={LINK}>⚙ Administração</Link>}
      {ehEquipe && <Link href="/colaborador" className={LINK}>🏥 Equipe</Link>}
      <span className="hidden text-[var(--hc-ink-soft)] sm:inline">{email}</span>
      <button onClick={sair} className="hc-btn hc-btn-ghost px-4 py-2">
        Sair
      </button>
    </div>
  );
}
