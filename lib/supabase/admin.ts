import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Cliente ADMINISTRATIVO com a service role — IGNORA a RLS.
 * ⚠️ SOMENTE em código de servidor claramente isolado (webhooks, tarefas internas).
 * NUNCA importar em componentes de cliente nem expor a chave ao navegador.
 */
export function criarClienteAdmin() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!SUPABASE_URL || !serviceRole) {
    throw new Error(
      "Supabase service role não configurada (SUPABASE_SERVICE_ROLE_KEY). Use apenas no servidor.",
    );
  }
  return createClient(SUPABASE_URL, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
