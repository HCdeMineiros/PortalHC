-- ============================================================================
-- Portal HC — Migration 0009
-- Guarda o código de acesso do paciente (texto) para a equipe poder repassá-lo
-- quando o paciente não receber pelo WhatsApp. Acesso apenas via servidor
-- (Route Handlers com service role); RLS mantém a tabela protegida.
-- ============================================================================

alter table public.solicitacoes add column if not exists codigo_acesso text;
