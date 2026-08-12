"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente Supabase para o navegador (usa o JWT do usuário → a RLS é aplicada).
 * Nunca usar a service role aqui.
 */
export function criarClienteBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
