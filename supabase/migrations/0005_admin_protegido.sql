-- ============================================================================
-- Portal HC — Migration 0005
-- Marca o administrador DPO como "protegido": não pode ser excluído.
-- Outros administradores podem ser excluídos normalmente.
-- ============================================================================

alter table public.usuarios
  add column if not exists protegido boolean not null default false;

-- Protege o DPO principal (ajuste o e-mail se necessário)
update public.usuarios set protegido = true where email = 'hcdemineiros@gmail.com';
