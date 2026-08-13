-- ============================================================================
-- Portal HC — Migration 0002
-- Campos para persistir a cirurgia cadastrada pelo médico + acesso do paciente
-- + acomodação (lançada pela internação) + finalização do atendimento.
-- ============================================================================

alter table public.solicitacoes
  add column if not exists procedimento_nome       text,
  add column if not exists componentes_centavos    jsonb,   -- {cirurgiao, anestesista, auxiliar, hospital}
  add column if not exists codigo_acesso_hash       text,   -- senha do paciente (hash sha-256)
  add column if not exists acomodacao               text,   -- enfermaria | apartamento | suite | uti
  add column if not exists acomodacao_dias          integer,
  add column if not exists acomodacao_total_centavos integer,
  add column if not exists finalizada_em            timestamptz;

-- Busca do paciente por CPF (usada no acesso do paciente, no servidor)
create index if not exists idx_pacientes_cpf on public.pacientes (cpf);
create index if not exists idx_solic_paciente on public.solicitacoes (paciente_id);
