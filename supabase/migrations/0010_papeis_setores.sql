-- ============================================================================
-- Portal HC — Migration 0010
-- Novos setores de acesso da equipe: "administrativo" e "limpeza".
-- Adiciona os valores ao enum de papéis (não removê-los depois).
-- ============================================================================

alter type papel add value if not exists 'administrativo';
alter type papel add value if not exists 'limpeza';
