-- ============================================================================
-- Portal HC — Migration inicial (Fase 1)
-- Esquema do domínio + RLS. Dados de saúde = dados sensíveis (LGPD art. 11).
-- Aplicar no projeto Supabase (região São Paulo / sa-east-1).
-- ============================================================================

-- Papéis (RBAC) -------------------------------------------------------------
do $$ begin
  create type papel as enum ('admin_dpo','medico','internacao','paciente','faturamento','enfermagem');
exception when duplicate_object then null; end $$;

-- Estados da solicitação ----------------------------------------------------
do $$ begin
  create type status_solicitacao as enum (
    'rascunho','aguardando_paciente','documentos_pendentes','termos_assinados',
    'liberada_para_admissao','realizada','encerrada','cancelada');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Usuários / Colaboradores (1:1 com auth.users)
-- ============================================================================
create table if not exists public.usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null,
  email         text,
  telefone      text,
  papel         papel not null default 'medico',
  ativo         boolean not null default true,
  mfa_habilitado boolean not null default false,
  criado_em     timestamptz not null default now()
);

-- Helper: papel do usuário autenticado (SECURITY DEFINER evita recursão de RLS)
create or replace function public.papel_atual()
returns papel language sql stable security definer set search_path = public as $$
  select papel from public.usuarios where id = auth.uid()
$$;

create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and papel = 'admin_dpo' and ativo)
$$;

-- ============================================================================
-- Médicos
-- ============================================================================
create table if not exists public.medicos (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid references public.usuarios(id) on delete set null,
  nome         text not null,
  crm          text,
  especialidade text,
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now()
);

-- ============================================================================
-- Pacientes  (identificação SEMPRE por CPF + data de nascimento)
-- ============================================================================
create table if not exists public.pacientes (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  cpf                   text not null unique,
  data_nascimento       date not null,
  telefone_whatsapp     text,
  email                 text,
  sexo                  text,
  ref_externa_promedico text,            -- reservado p/ futura integração (não usar agora)
  criado_por            uuid references public.usuarios(id),
  criado_em             timestamptz not null default now()
);

-- ============================================================================
-- Catálogo de procedimentos + tabela de preços versionada
-- ============================================================================
create table if not exists public.procedimentos (
  id        uuid primary key default gen_random_uuid(),
  codigo    text unique,
  nome      text not null,
  descricao text,
  ativo     boolean not null default true
);

create table if not exists public.tabela_precos (
  id             uuid primary key default gen_random_uuid(),
  procedimento_id uuid not null references public.procedimentos(id) on delete cascade,
  versao         text not null,
  valor_centavos integer not null check (valor_centavos >= 0),
  componentes    jsonb,                  -- cirurgiao, auxiliar, anestesista, hospital...
  vigente_de     date not null default current_date,
  vigente_ate    date,                   -- null = vigente
  criado_por     uuid references public.usuarios(id),
  criado_em      timestamptz not null default now()
);

-- ============================================================================
-- Solicitação de internação/cirurgia (máquina de estados)
-- ============================================================================
create table if not exists public.solicitacoes (
  id                    uuid primary key default gen_random_uuid(),
  numero                text unique,
  paciente_id           uuid not null references public.pacientes(id),
  medico_id             uuid not null references public.medicos(id),
  data_prevista         date,
  status                status_solicitacao not null default 'rascunho',
  valor_total_centavos  integer,
  observacoes           text,
  ref_externa_promedico text,            -- reservado
  criado_por            uuid references public.usuarios(id),
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);

create table if not exists public.solicitacao_procedimentos (
  id             uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes(id) on delete cascade,
  procedimento_id uuid not null references public.procedimentos(id),
  preco_id       uuid references public.tabela_precos(id),
  quantidade     integer not null default 1
);

-- ============================================================================
-- Modelos de termo (templates versionados) + documentos gerados + assinaturas
-- ============================================================================
create table if not exists public.modelos_termo (
  id               uuid primary key default gen_random_uuid(),
  chave            text not null,
  titulo           text not null,
  tipo             text not null check (tipo in ('termo_consentimento','documento_informativo')),
  versao           text not null,
  corpo            jsonb not null,        -- parágrafos + variáveis
  exige_assinatura boolean not null default true,
  exige_ok         boolean not null default false,
  ativo            boolean not null default true,
  publicado_em     timestamptz not null default now(),
  unique (chave, versao)
);

create table if not exists public.documentos_gerados (
  id             uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes(id) on delete cascade,
  modelo_id      uuid not null references public.modelos_termo(id),
  paciente_id    uuid not null references public.pacientes(id),
  tipo           text not null,
  status         text not null default 'gerado' check (status in ('gerado','aguardando','assinado','ok_dado')),
  storage_path   text,
  hash_sha256    text,
  criado_em      timestamptz not null default now()
);

create table if not exists public.assinaturas (
  id                    uuid primary key default gen_random_uuid(),
  documento_id          uuid not null references public.documentos_gerados(id),
  paciente_id           uuid not null references public.pacientes(id),
  metodo                text not null,
  otp_verificado        boolean not null default false,
  carimbo_tempo_servidor timestamptz not null default now(),
  ip                    text,
  user_agent            text,
  geolocalizacao        jsonb,
  hash_documento_sha256 text not null,
  codigo_verificacao    text unique,
  qr_payload            text,
  pdf_final_path        text,
  criado_em             timestamptz not null default now()
);

create table if not exists public.oks_documento (
  id             uuid primary key default gen_random_uuid(),
  documento_id   uuid not null references public.documentos_gerados(id),
  paciente_id    uuid not null references public.pacientes(id),
  carimbo_tempo_servidor timestamptz not null default now(),
  ip             text,
  user_agent     text,
  criado_em      timestamptz not null default now()
);

create table if not exists public.otp_codigos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete cascade,
  codigo_hash  text not null,
  canal        text not null check (canal in ('whatsapp','email')),
  expira_em    timestamptz not null,
  tentativas   integer not null default 0,
  usado_em     timestamptz,
  criado_em    timestamptz not null default now()
);

-- ============================================================================
-- Auditoria (append-only) + registro de downloads
-- ============================================================================
create table if not exists public.auditoria (
  id              bigint generated always as identity primary key,
  ator_usuario_id uuid,
  acao            text not null,
  entidade        text,
  entidade_id     text,
  status_anterior text,
  status_novo     text,
  detalhe         jsonb,
  ip              text,
  user_agent      text,
  criado_em       timestamptz not null default now()
);

create table if not exists public.downloads_documento (
  id                     bigint generated always as identity primary key,
  documento_id           uuid references public.documentos_gerados(id),
  quem                   text,
  url_assinada_emitida_em timestamptz not null default now(),
  expira_em              timestamptz,
  ip                     text,
  user_agent             text
);

-- Imutabilidade: bloqueia UPDATE/DELETE nas tabelas append-only ------------
create or replace function public.bloquear_alteracao()
returns trigger language plpgsql as $$
begin
  raise exception 'Registro imutável: alteração/remoção não permitida';
end $$;

do $$
declare t text;
begin
  foreach t in array array['auditoria','assinaturas','oks_documento','documentos_gerados'] loop
    execute format('drop trigger if exists trg_imutavel_%1$s on public.%1$s', t);
    execute format('create trigger trg_imutavel_%1$s before update or delete on public.%1$s
                    for each row execute function public.bloquear_alteracao()', t);
  end loop;
end $$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.usuarios       enable row level security;
alter table public.medicos        enable row level security;
alter table public.pacientes      enable row level security;
alter table public.procedimentos  enable row level security;
alter table public.tabela_precos  enable row level security;
alter table public.solicitacoes   enable row level security;
alter table public.solicitacao_procedimentos enable row level security;
alter table public.modelos_termo  enable row level security;
alter table public.documentos_gerados enable row level security;
alter table public.assinaturas    enable row level security;
alter table public.oks_documento  enable row level security;
alter table public.auditoria      enable row level security;
alter table public.downloads_documento enable row level security;

-- usuarios: cada um vê a si; admin vê todos
create policy usuarios_self_select on public.usuarios for select
  using (id = auth.uid() or public.eh_admin());
create policy usuarios_admin_all on public.usuarios for all
  using (public.eh_admin()) with check (public.eh_admin());

-- catálogo: leitura para colaboradores autenticados; escrita só admin
create policy proc_select on public.procedimentos for select using (auth.uid() is not null);
create policy proc_admin  on public.procedimentos for all using (public.eh_admin()) with check (public.eh_admin());
create policy precos_select on public.tabela_precos for select using (auth.uid() is not null);
create policy precos_admin  on public.tabela_precos for all using (public.eh_admin()) with check (public.eh_admin());
create policy modelos_select on public.modelos_termo for select using (auth.uid() is not null);
create policy modelos_admin  on public.modelos_termo for all using (public.eh_admin()) with check (public.eh_admin());

-- medicos: leitura autenticada; escrita admin
create policy medicos_select on public.medicos for select using (auth.uid() is not null);
create policy medicos_admin  on public.medicos for all using (public.eh_admin()) with check (public.eh_admin());

-- pacientes: admin e internação veem todos; médico vê os seus (via solicitação)
create policy pacientes_admin_internacao on public.pacientes for select
  using (public.papel_atual() in ('admin_dpo','internacao'));
create policy pacientes_do_medico on public.pacientes for select
  using (exists (
    select 1 from public.solicitacoes s
    join public.medicos m on m.id = s.medico_id
    where s.paciente_id = pacientes.id and m.usuario_id = auth.uid()
  ));
create policy pacientes_insert on public.pacientes for insert
  with check (public.papel_atual() in ('admin_dpo','medico','internacao'));

-- solicitacoes: admin/internação todas; médico só as suas
create policy solic_admin_internacao on public.solicitacoes for select
  using (public.papel_atual() in ('admin_dpo','internacao'));
create policy solic_do_medico on public.solicitacoes for all
  using (exists (select 1 from public.medicos m where m.id = solicitacoes.medico_id and m.usuario_id = auth.uid()))
  with check (exists (select 1 from public.medicos m where m.id = solicitacoes.medico_id and m.usuario_id = auth.uid()));
create policy solic_internacao_update on public.solicitacoes for update
  using (public.papel_atual() = 'internacao');

-- auditoria: leitura só admin; INSERT por qualquer autenticado; sem update/delete (trigger)
create policy auditoria_admin_select on public.auditoria for select using (public.eh_admin());
create policy auditoria_insert on public.auditoria for insert with check (auth.uid() is not null);

-- documentos/assinaturas/oks: leitura admin/internação; médico dono (via solicitação)
create policy docs_select on public.documentos_gerados for select
  using (public.papel_atual() in ('admin_dpo','internacao')
    or exists (select 1 from public.solicitacoes s join public.medicos m on m.id=s.medico_id
               where s.id = documentos_gerados.solicitacao_id and m.usuario_id = auth.uid()));
create policy docs_insert on public.documentos_gerados for insert with check (auth.uid() is not null);

create policy assin_select on public.assinaturas for select using (public.papel_atual() in ('admin_dpo','internacao'));
create policy assin_insert on public.assinaturas for insert with check (auth.uid() is not null);
create policy oks_select on public.oks_documento for select using (public.papel_atual() in ('admin_dpo','internacao'));
create policy oks_insert on public.oks_documento for insert with check (auth.uid() is not null);

-- NB: o acesso do PACIENTE (via duplo fator/OTP) será feito por Route Handlers
-- no servidor, usando a service role de forma isolada + verificação do OTP,
-- pois o paciente não é um auth.users neste MVP. Detalhar na fatia do paciente.
