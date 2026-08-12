# Portal HC — Setup do Supabase (Fase 1)

Fundação de banco/auth/storage. Enquanto não houver projeto configurado, o app roda em
**modo demonstração** (dados fictícios). Ao preencher as variáveis, a integração passa a valer.

## 1. Criar o projeto
1. Conta Supabase do **hospital** → **New project**.
2. **Region: South America (São Paulo) — `sa-east-1`** (dados no Brasil).
3. Defina uma **senha forte** do banco (guarde com segurança).
4. Plano: Free serve para dev/demonstração; produção → plano pago (backups/PITR).

## 2. Pegar as credenciais
Em **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **só no servidor**, nunca no navegador)

## 3. Configurar o ambiente
Local: copie `.env.example` para `.env.local` e preencha os 3 valores.
Produção (Vercel): **Project → Settings → Environment Variables**, adicione os 3
(o `SUPABASE_SERVICE_ROLE_KEY` como *Sensitive*).

## 4. Aplicar a migration
Opção simples (sem CLI): abra **SQL Editor** no Supabase, cole o conteúdo de
`supabase/migrations/0001_init.sql` e **Run**.
Opção CLI (futuro): `supabase db push` com a Supabase CLI.

## 5. Segurança já embutida na migration
- **RLS ligada** em todas as tabelas; políticas por papel (admin/DPO, médico, internação).
- Médico enxerga **apenas** seus pacientes/solicitações.
- Tabelas **append-only** (`auditoria`, `assinaturas`, `oks_documento`, `documentos_gerados`)
  com trigger que **bloqueia UPDATE/DELETE** (imutabilidade probatória).
- Campos `ref_externa_promedico` reservados para futura integração.

## 6. Autenticação
- **Colaboradores** (médico/internação/admin): Supabase Auth (e-mail+senha), com **MFA** a habilitar.
  Cada colaborador tem uma linha em `public.usuarios` (id = `auth.users.id`) com seu `papel`.
- **Paciente**: NÃO é um `auth.users` neste MVP. O acesso é por **duplo fator** (CPF + data de
  nascimento + **OTP** por WhatsApp) validado em Route Handlers no servidor, que usam a service
  role de forma isolada apenas após conferir o OTP. (Detalhe na fatia do paciente.)

## 7. Próximos passos de integração (ordem sugerida)
1. **Auth de colaborador** + tela de login (médico) e guarda de rota (só médico na aba de cirurgia).
2. **Seed** do catálogo real (`lib/data/procedimentos.ts` → `procedimentos` + `tabela_precos`) e
   dos termos (`lib/data/termos.ts` → `modelos_termo`).
3. **Cadastro de cirurgia** do médico gravando em `solicitacoes` (+ paciente + OTP de acesso).
4. **Portal do paciente** lendo a solicitação real e registrando assinatura/OK com o pacote probatório.
5. **Storage** (bucket privado) + geração de PDF assinado com trilha/QR.

> Clientes já prontos em `lib/supabase/`: `client.ts` (browser), `server.ts` (servidor),
> `admin.ts` (service role, isolado). `env.ts` expõe `SUPABASE_CONFIGURADO`.
