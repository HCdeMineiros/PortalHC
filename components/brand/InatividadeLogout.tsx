"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/env";

const MINUTOS_INATIVIDADE = 30;
const AVISO_ANTES_SEG = 60; // avisa 1 minuto antes

/**
 * Encerra a sessão após 30 min sem atividade. 1 minuto antes, mostra um aviso
 * com contagem regressiva e a opção "Continuar conectado".
 * Enquanto o aviso está na tela, a atividade não reinicia sozinha — o usuário
 * precisa confirmar (ou é desconectado ao zerar).
 */
export function InatividadeLogout() {
  const router = useRouter();
  const [avisando, setAvisando] = useState(false);
  const [restante, setRestante] = useState(AVISO_ANTES_SEG);
  const reagendarRef = useRef<() => void>(() => {});
  const deslogarRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let deslogando = false;
    let tAviso: ReturnType<typeof setTimeout> | null = null;
    let tLogout: ReturnType<typeof setTimeout> | null = null;
    let tContagem: ReturnType<typeof setInterval> | null = null;
    let avisandoLocal = false;

    function limpar() {
      if (tAviso) clearTimeout(tAviso);
      if (tLogout) clearTimeout(tLogout);
      if (tContagem) clearInterval(tContagem);
    }

    async function deslogar() {
      if (deslogando) return;
      deslogando = true;
      limpar();
      try {
        const { criarClienteBrowser } = await import("@/lib/supabase/client");
        await criarClienteBrowser().auth.signOut();
      } catch {
        /* ignora */
      }
      router.replace("/medico/login?motivo=inatividade");
    }

    function agendar() {
      limpar();
      avisandoLocal = false;
      setAvisando(false);
      tAviso = setTimeout(() => {
        avisandoLocal = true;
        setRestante(AVISO_ANTES_SEG);
        setAvisando(true);
        tContagem = setInterval(() => setRestante((r) => (r > 0 ? r - 1 : 0)), 1000);
      }, (MINUTOS_INATIVIDADE * 60 - AVISO_ANTES_SEG) * 1000);
      tLogout = setTimeout(deslogar, MINUTOS_INATIVIDADE * 60 * 1000);
    }

    function aoInteragir() {
      if (avisandoLocal) return; // com o aviso aberto, só o botão reinicia
      agendar();
    }

    reagendarRef.current = agendar;
    deslogarRef.current = deslogar;

    const eventos = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    eventos.forEach((e) => window.addEventListener(e, aoInteragir, { passive: true }));
    agendar();

    return () => {
      limpar();
      eventos.forEach((e) => window.removeEventListener(e, aoInteragir));
    };
  }, [router]);

  if (!avisando) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="hc-card hc-gold-frame w-full max-w-sm p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--hc-red-050)] text-2xl">⏳</div>
        <h2 className="mt-4 font-serif text-xl font-semibold text-[var(--hc-ink)]">Sessão prestes a expirar</h2>
        <p className="mt-2 text-sm text-[var(--hc-ink-soft)]">
          Por inatividade, você será desconectado em{" "}
          <strong className="font-mono text-[var(--hc-red-600)]">{restante}s</strong>.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              setAvisando(false);
              reagendarRef.current();
            }}
            className="hc-btn hc-btn-primary flex-1"
          >
            Continuar conectado
          </button>
          <button onClick={() => deslogarRef.current()} className="hc-btn hc-btn-ghost">
            Sair agora
          </button>
        </div>
      </div>
    </div>
  );
}
