-- ============================================================================
-- Portal HC — Migration 0013
-- Integração Assinafy: controle das assinaturas por documento da solicitação
-- e o "cofre" (bucket privado) para guardar a nossa cópia do PDF assinado.
-- ============================================================================

create table if not exists public.assinafy_docs (
  id                   uuid primary key default gen_random_uuid(),
  solicitacao_id       uuid not null references public.solicitacoes(id) on delete cascade,
  documento_chave      text not null,
  assinafy_document_id text,
  signer_id            text,
  signing_url          text,
  status               text not null default 'criado', -- criado | enviado | assinado | erro
  arquivo_path         text,                            -- caminho no Storage (cópia assinada)
  criado_em            timestamptz not null default now(),
  assinado_em          timestamptz,
  unique (solicitacao_id, documento_chave)
);

-- Acesso somente via servidor (service_role). RLS liga sem políticas: nega anon/authenticated.
alter table public.assinafy_docs enable row level security;

create index if not exists idx_assinafy_docs_sol on public.assinafy_docs (solicitacao_id);
create index if not exists idx_assinafy_docs_docid on public.assinafy_docs (assinafy_document_id);

-- Cofre privado para as cópias assinadas
insert into storage.buckets (id, name, public)
values ('documentos-assinados', 'documentos-assinados', false)
on conflict (id) do nothing;
