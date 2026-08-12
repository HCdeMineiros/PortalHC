/**
 * Leitura e validação das variáveis do Supabase.
 * Enquanto não houver projeto configurado, `SUPABASE_CONFIGURADO` é false
 * e o app continua funcionando em modo demonstração (dados fictícios).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** true quando as credenciais públicas do Supabase estão presentes. */
export const SUPABASE_CONFIGURADO = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
