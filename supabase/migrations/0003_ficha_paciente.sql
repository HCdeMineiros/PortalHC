-- ============================================================================
-- Portal HC — Migration 0003
-- Passamos a identificar o paciente por CPF + Nº da FICHA (sistema do hospital),
-- guardada em ref_externa_promedico. Data de nascimento vira opcional.
-- ============================================================================

alter table public.pacientes alter column data_nascimento drop not null;

-- índice para busca por ficha (usada no acesso do paciente)
create index if not exists idx_pacientes_ref_externa on public.pacientes (ref_externa_promedico);
