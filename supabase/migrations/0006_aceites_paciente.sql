-- ============================================================================
-- Portal HC — Migration 0006
-- Aceites/assinaturas do paciente (com evidências). Escrita só via servidor
-- (service role), após validar CPF + ficha + código. RLS bloqueia acesso público.
-- ============================================================================

create table if not exists public.aceites_paciente (
  id                 uuid primary key default gen_random_uuid(),
  solicitacao_id     uuid not null references public.solicitacoes(id) on delete cascade,
  documento_chave    text not null,
  tipo               text not null check (tipo in ('assinatura', 'ok')),
  nome_digitado      text,
  assinatura_dataurl text,
  carimbo_tempo      timestamptz not null default now(),
  ip                 text,
  user_agent         text,
  unique (solicitacao_id, documento_chave)
);

alter table public.aceites_paciente enable row level security;
-- sem policies: acesso apenas via service role (Route Handlers do paciente)

create index if not exists idx_aceites_solicitacao on public.aceites_paciente (solicitacao_id);
