"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente Supabase do navegador com sessão APENAS EM MEMÓRIA.
 * `persistSession: false` → a sessão NÃO é gravada em cookie/localStorage.
 * Consequência desejada: ao dar F5 ou sair do site, a sessão some e o
 * login é exigido novamente. Um singleton mantém a sessão durante a
 * navegação interna (sem recarregar a página).
 */
let _client: SupabaseClient | null = null;

export function criarClienteBrowser() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}
