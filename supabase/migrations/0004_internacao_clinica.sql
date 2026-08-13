-- ============================================================================
-- Portal HC — Migration 0004
-- Internação clínica (sem cirurgia): honorário médico por acomodação (por diária).
-- ============================================================================

alter table public.solicitacoes
  add column if not exists tipo text not null default 'cirurgia',      -- 'cirurgia' | 'internacao_clinica'
  add column if not exists honorarios_acomodacao_centavos jsonb;        -- {enfermaria, apartamento, suite} por diária
