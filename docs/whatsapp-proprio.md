# Nosso WhatsApp (número do hospital) — estado e guia

Envio de WhatsApp pelo número dedicado do hospital **(64) 99928-2850**, via
**WhatsApp Cloud API oficial (Meta)**, chamada **direto** pelo backend do Portal HC
(decidimos **não usar n8n**).

## Como vai funcionar

```
Portal HC (backend)  --HTTPS-->  graph.facebook.com (Cloud API)  -->  WhatsApp do paciente
```

O Portal HC faz um POST para `https://graph.facebook.com/<versao>/<PHONE_NUMBER_ID>/messages`
com `Authorization: Bearer <TOKEN_PERMANENTE>`, enviando um **modelo (template) aprovado**.

## Dados já configurados na Meta (2026-09-09)

- Conta dona: Facebook do hospital **hcdemineiros@gmail.com**
- Portfólio empresarial: **Hospital das Clínicas de Mineiros** — id `1348549214028511`
- App (developers.facebook.com): **Portal HC Mensagens** (tipo Business, caso de uso "Conectar-se com clientes pelo WhatsApp")
- **WABA real** id: `1054409917211110`
- **Número real** (64) 99928-2850 → **Phone Number ID: `1262219976983322`** (status: *Não registrado*)
- Número de **teste** grátis: +1 555 677-8907 (Phone Number ID `1230477020157354`) — já testado, entrega OK
- Razão social: **Hospital das Clínicas de Mineiros Ltda** — CNPJ **37.412.400/0001-14**

## Status atual

| Item | Situação |
|---|---|
| Pagamento (cartão) | ✅ adicionado |
| Verificação do CNPJ | ⏳ **Em processamento** (aguardando Meta) |
| Template `codigo_acesso` (Utilidade) | ⏳ **Em análise** — aviso + link (sem código) |
| Registrar número real | 🔒 bloqueado até a verificação aprovar |
| Template do código (Autenticação) | 🔒 bloqueado até a verificação aprovar |

> A Meta força mensagens que contêm um código para a categoria **Autenticação**
> (formato rígido, sem link). Por isso o `codigo_acesso` (Utilidade) leva só o aviso +
> link, e o **código** irá num segundo template de **Autenticação** (`codigo_acesso_hc`,
> opção "Copiar código", sem expiração), a ser criado quando a conta liberar.

## Templates

**1) `codigo_acesso`** — Utilidade, pt_BR (Em análise)
Corpo (variáveis: {{1}}=nome, {{2}}=procedimento):
> Olá {{1}}! Seus documentos do procedimento {{2}} no Hospital das Clínicas de Mineiros já estão disponíveis para leitura e assinatura. Acesse o portal do paciente em www.portalhc.com.br/paciente/acesso. Em caso de dúvidas, procure a recepção do hospital.

**2) `codigo_acesso_hc`** — Autenticação, "Copiar código", sem expiração (a criar)
Entrega o código de acesso ({{1}} = código). Texto é padrão da Meta.

## Retomar quando a Meta aprovar o CNPJ

1. **Registrar o número real**: no app → Etapa 2 → "Registrar" (criar PIN de 6 dígitos — guardar — + código SMS no (64) 99928-2850). Status vira registrado/ativo.
2. **Criar o template de Autenticação** `codigo_acesso_hc` (Copiar código, sem expiração).
3. **Gerar um token permanente**: Business Settings → Usuários → **Usuário do sistema** → criar, dar acesso ao App "Portal HC Mensagens" e ao WABA, gerar token com permissões **whatsapp_business_messaging** + **whatsapp_business_management**. (Guardar com segurança — nunca no chat.)
4. **Reescrever** `lib/notifications/whatsapp.ts` para POST direto em graph.facebook.com (remover a dependência de n8n).
5. **Vercel → Environment Variables** e depois Redeploy:
   - `WHATSAPP_TOKEN` = token permanente
   - `WHATSAPP_PHONE_NUMBER_ID` = `1262219976983322`
   - `WHATSAPP_API_VERSION` = `v21.0`
   - `NEXT_PUBLIC_APP_URL` = `https://www.portalhc.com.br`
6. **Testar** ponta a ponta: cadastrar cirurgia de teste com WhatsApp → paciente recebe aviso+link (e código, quando o 2º template estiver aprovado).

## Observações

- Restrição de **anúncios** no portfólio = irrelevante (não vamos anunciar).
- Custo: **1.000 conversas de serviço/mês grátis**; cobre o volume do hospital.
- `lib/notifications/whatsapp.ts` **ainda aponta para o n8n** — será reescrito no passo 4.
