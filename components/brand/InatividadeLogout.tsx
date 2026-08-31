"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

const MINUTOS_INATIVIDADE = 30;

/**
 * Encerra a sessão automaticamente após 30 minutos sem atividade do usuário.
 * Qualquer movimento de mouse, tecla, clique, toque ou rolagem reinicia o
 * contador. Ao expirar, faz signOut e volta ao login.
 */
export function InatividadeLogout() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let deslogando = false;

    async function deslogar() {
      if (deslogando) return;
      deslogando = true;
      try {
        const { criarClienteBrowser } = await import("@/lib/supabase/client");
        await criarClienteBrowser().auth.signOut();
      } catch {
        /* ignora */
      }
      router.replace("/medico/login?motivo=inatividade");
    }

    function reiniciar() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(deslogar, MINUTOS_INATIVIDADE * 60 * 1000);
    }

    const eventos = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    eventos.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }));
    reiniciar();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
    };
  }, [router]);

  return null;
}
