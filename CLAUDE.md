# CLAUDE.md — Portal HC

Contexto e convenções para o Claude Code trabalhar neste repositório.

## O que é
**Portal HC** (www.portalhc.com.br) — sistema web (PWA) do **Hospital das Clínicas de Mineiros/GO**
para internação e cirurgia de pacientes **particulares**. Médico cadastra a cirurgia; paciente
lê e **assina eletronicamente** os termos de consentimento e **dá "OK"** aos documentos
informativos; Internação libera a admissão ("OK digital"). Finalidade jurídica: reduzir risco de
ações por alegação de erro médico e diminuir papel. Condutor do projeto: **Dr. Denis Carvalho**
(advogado em Direito Médico e DPO da instituição — não é desenvolvedor; explicar escolhas em
linguagem clara e preferir a solução mais simples e segura).

Documento-fonte do escopo: `../Portal HC - Prompt_Claude_Code_Portal_HC.md`.
Plano detalhado: `docs/00_PLANO_FASE1.md` (e demais arquivos em `docs/`).

## Stack
- Next.js (App Router) + TypeScript — monólito full-stack (UI + API no mesmo projeto).
- Supabase (região São Paulo `sa-east-1`): Auth (MFA p/ colaboradores), Postgres + **RLS**, Storage privado (URLs assinadas).
- Tailwind CSS v4 (tema em `app/globals.css`) + componentes acessíveis. PWA instalável.
- PDF no servidor; `SignatureProvider` (assinatura avançada, Lei 14.063/2020); `NotificationService` (WhatsApp: **n8n** escolhido, Meta plugável).

## Regras inegociáveis
- Dados de saúde = **dados sensíveis** (LGPD art. 11). HTTPS, cripto em trânsito/repouso.
- Busca de paciente **nunca** só por CPF: sempre CPF + data de nascimento + OTP.
- **Nenhum segredo no código** (usar `.env.local`; `.env.example` sem valores).
- **Auditoria imutável** de acessos/ações. Storage privado; documentos assinados **imutáveis**.
- Cliente Supabase sempre com JWT do usuário (RLS vale). `service_role` só em servidor marcado.
- Nunca ação irreversível (deletar, publicar, DNS, produção) sem aval do Dr. Denis.
- Desenvolver com **dados fictícios** — nunca dados reais.

## Estado atual (Fase 1, em construção)
- ✅ Fundação Next.js + tema HC (vermelho/dourado, luxuoso) + logos.
- ✅ Fatia 5 (demonstração, dados fictícios): acesso do paciente (duplo fator mock), painel,
  leitura + assinatura de termos + "OK" de documentos informativos.
- ⏳ Próximo: Supabase real (dev), fundação de auth/RLS/auditoria, catálogo de procedimentos,
  geração de PDF com trilha/QR, envio via n8n.

## Estrutura
- `app/` rotas (App Router). `app/paciente/` fluxo do paciente. `app/colaborador/` área da equipe (placeholder).
- `components/` UI e marca. `lib/` brand, mock, (futuro) supabase/signature/notifications/pdf/audit.
- `docs/` plano, modelo de dados, máquina de estados, LGPD/ADRs. `assets/brand/` fontes de marca.

## Comandos
- `npm run dev` — servidor de desenvolvimento (http://localhost:3000).
- `npm run build` / `npm start` — build e produção.
- `npm run lint` — ESLint.

## Convenções
- Código e UI em **português** (identificadores de domínio em pt-BR quando fizer sentido).
- Conventional commits; PRs pequenos; testes no CI antes de merge.
- Cores/estilos via tokens do tema (`app/globals.css`), não hardcode espalhado.
