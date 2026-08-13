-- ============================================================================
-- Portal HC — Migration 0008
-- A internação clínica pode ser cadastrada pela equipe (ex.: atendente do PS),
-- que não é médico. Por isso o médico da solicitação passa a ser opcional.
-- ============================================================================

alter table public.solicitacoes alter column medico_id drop not null;
