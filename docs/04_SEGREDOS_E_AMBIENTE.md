# Portal HC — Segredos, Variáveis de Ambiente e o que você precisa providenciar

Nenhum segredo vai para o Git. Tudo em `.env` (fora do versionamento) + `.env.example` sem valores reais.

## Variáveis de ambiente previstas
```
# App
NEXT_PUBLIC_APP_URL=https://www.portalhc.com.br
NODE_ENV=development

# Supabase (projeto região São Paulo sa-east-1)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # só no servidor, nunca exposto ao cliente

# WhatsApp — escolher UM provedor
WHATSAPP_PROVIDER=meta               # "meta" ou "n8n"
# se meta (Cloud API oficial):
META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_ID=
META_WHATSAPP_TEMPLATE_OTP=
# se n8n:
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# OTP / segurança
OTP_TTL_SEGUNDOS=300
OTP_MAX_TENTATIVAS=5

# PDF / verificação
VERIFICACAO_BASE_URL=https://www.portalhc.com.br/verificar
```

## O que você (Dr. Denis) precisa providenciar

**Supabase**
1. Criar conta e um **projeto novo na região São Paulo (sa-east-1)**.
2. Me enviar (por canal seguro, não no chat público): `Project URL`, `anon key` e `service_role key`.
3. Habilitar backups (plano que permita point-in-time recovery, se desejar).

**Domínio**
4. Confirmar onde está registrado o `portalhc.com.br` (Registro.br?) — a alteração de DNS só faremos com seu aval, na hora do deploy.

**WhatsApp** — escolher o caminho:
- **Meta Cloud API oficial:** precisa de conta Meta Business, número dedicado e templates utilitários aprovados. Mais robusto, tem custo por conversa.
- **n8n existente:** você já opera um n8n; me passa a URL do webhook + um segredo. Mais rápido de começar.

**GitHub**
5. Confirmar se criamos o repositório **privado** na sua conta (DenisCarvalho10) ou em outra.

**Hospedagem**
6. Sugestão: Vercel (como seus outros projetos) para a aplicação Next.js; Supabase cuida do banco/arquivos. Confirmar.

> Nada disso bloqueia começar o scaffolding — posso montar tudo com **dados fictícios** e um Supabase de dev enquanto você providencia as credenciais oficiais.
