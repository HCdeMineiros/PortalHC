# Portal HC

Sistema web (PWA) do **Hospital das Clínicas de Mineiros/GO** para internação e cirurgia de
pacientes particulares, com **assinatura eletrônica** de termos de consentimento e conformidade
com a LGPD. Domínio: **www.portalhc.com.br**.

## Rodar em desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha quando tiver as credenciais
npm run dev
```

Acesse http://localhost:3000. Fluxo de demonstração do paciente:
`/paciente/acesso` → (duplo fator, código na tela em modo demo) → `/paciente/painel`.

## Documentação

Ver a pasta [`docs/`](docs/):
- [Plano da Fase 1](docs/00_PLANO_FASE1.md)
- [Modelo de dados + RLS](docs/01_MODELO_DADOS.md)
- [Máquina de estados](docs/02_MAQUINA_ESTADOS.md)
- [Assinatura eletrônica](docs/03_ASSINATURA_ELETRONICA.md)
- [Segredos e ambiente](docs/04_SEGREDOS_E_AMBIENTE.md)
- [Perguntas em aberto](docs/05_PERGUNTAS_ABERTAS.md)

## Stack

Next.js (App Router) + TypeScript · Supabase (Auth/Postgres+RLS/Storage) · Tailwind CSS · PWA ·
PDF no servidor · WhatsApp via n8n (Meta plugável).

> ⚠️ Desenvolvimento sempre com **dados fictícios**. Nada de dados reais no repositório.
