-- ============================================================================
-- Portal HC — Migration 0012
-- Reforço de evidência dos aceites do paciente: guarda o hash (impressão
-- digital SHA-256) do texto exato do documento e o título, para comprovação.
-- ============================================================================

alter table public.aceites_paciente
  add column if not exists documento_hash text,
  add column if not exists documento_titulo text;
