-- ============================================================================
-- Portal HC — Migration 0007
-- Internação clínica: o médico seleciona UMA acomodação e informa UM honorário
-- por diária. A equipe apenas acrescenta o nº de diárias.
-- ============================================================================

alter table public.solicitacoes
  add column if not exists honorario_medico_diaria_centavos integer;
