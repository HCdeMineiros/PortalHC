-- ============================================================================
-- Portal HC — Migration 0011
-- Novo setor de acesso da equipe: "cobranca".
-- ============================================================================

alter type papel add value if not exists 'cobranca';
