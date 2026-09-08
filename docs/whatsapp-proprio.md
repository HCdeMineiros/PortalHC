# Nosso WhatsApp (número do hospital) — guia de configuração

Sistema de envio de WhatsApp pelo número **(64) 99928-2850**, dedicado ao Portal HC,
usando a **WhatsApp Cloud API oficial (Meta)** com o **n8n** como ponte.

O código do Portal HC já está pronto: ele só chama o webhook do n8n com o que enviar.
Falta configurar (1) a Meta e (2) o fluxo no n8n, e (3) as variáveis no Vercel.

## Como funciona (visão geral)

```
Portal HC  --(webhook)-->  n8n  --(Cloud API)-->  WhatsApp do paciente
```

O Portal manda ao n8n um JSON simples, por exemplo:

```json
{ "tipo": "codigo_acesso_paciente", "whatsapp": "5564999999999",
  "paciente_nome": "Maria", "codigo": "123456", "numero": "2026-001",
  "procedimento": "Colecistectomia", "link": "https://www.portalhc.com.br/paciente/acesso" }
```

e

```json
{ "tipo": "link_assinatura", "whatsapp": "5564999999999",
  "paciente_nome": "Maria", "documento_titulo": "Termo de Consentimento",
  "signing_url": "https://..." }
```

O n8n monta a mensagem e envia pela Cloud API.

## Passo 1 — Meta (WhatsApp Cloud API)

> Feito uma vez. Depois é só usar.

1. Acesse **business.facebook.com** e crie/entre no **Meta Business** do hospital.
2. Verifique a empresa (CNPJ) em *Configurações do negócio → Central de Segurança*.
   (Pode levar alguns dias; é normal.)
3. Em **developers.facebook.com** → *Criar aplicativo* → tipo **Business** → adicione o
   produto **WhatsApp**.
4. Em *WhatsApp → Configuração da API*:
   - **Adicionar número de telefone** → cadastre **(64) 99928-2850**.
     ⚠️ Esse número **deixa de funcionar no app normal** do WhatsApp — ele passa a ser
     da plataforma. (Já combinado: é dedicado só ao sistema.)
   - Confirme o código por SMS/ligação.
5. Crie um **modelo de mensagem** (Message Template) para cada tipo. Ex.:
   - Nome: `codigo_acesso` — categoria **Utility** — corpo:
     `Olá {{1}}! Seus documentos do procedimento {{2}} no HC de Mineiros estão prontos. Acesse {{3}} e use o código {{4}}.`
   - Nome: `link_assinatura` — categoria **Utility** — corpo:
     `Olá {{1}}! Para assinar o {{2}}, acesse: {{3}}`
   - Aprovação costuma sair em minutos/horas.
6. Anote (para colocar no n8n, **não no chat**):
   - **Phone Number ID** e **WhatsApp Business Account ID**
   - **Token permanente** (gere um *System User token* com permissão `whatsapp_business_messaging`)

## Passo 2 — n8n (a ponte)

1. Crie um workflow novo com um nó **Webhook** (método POST). Copie a **URL de produção**.
2. Proteja com um segredo: no nó Webhook, exija o header `x-webhook-secret`
   (ou compare `{{$json.headers['x-webhook-secret']}}` num nó IF).
3. Um nó **Switch** pelo campo `{{$json.body.tipo}}`:
   - `codigo_acesso_paciente` → usa o template `codigo_acesso`
   - `link_assinatura` → usa o template `link_assinatura`
4. Nó **HTTP Request** (POST) para a Cloud API:
   - URL: `https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages`
   - Header: `Authorization: Bearer <TOKEN_PERMANENTE>`
   - Body (JSON), exemplo para o código de acesso:
     ```json
     {
       "messaging_product": "whatsapp",
       "to": "={{$json.body.whatsapp}}",
       "type": "template",
       "template": {
         "name": "codigo_acesso",
         "language": { "code": "pt_BR" },
         "components": [{ "type": "body", "parameters": [
           { "type": "text", "text": "={{$json.body.paciente_nome}}" },
           { "type": "text", "text": "={{$json.body.procedimento}}" },
           { "type": "text", "text": "={{$json.body.link}}" },
           { "type": "text", "text": "={{$json.body.codigo}}" }
         ]}]
       }
     }
     ```
5. Ative o workflow.

## Passo 3 — Vercel (variáveis)

No projeto `portal-hc` → *Settings → Environment Variables*, adicione:

| Variável | Valor |
|---|---|
| `N8N_WEBHOOK_URL` | a URL de produção do webhook do n8n |
| `N8N_WEBHOOK_SECRET` | o mesmo segredo do passo 2.2 |
| `NEXT_PUBLIC_APP_URL` | `https://www.portalhc.com.br` |

Depois faça um **Redeploy** para as variáveis valerem.

## Teste

1. Cadastre uma cirurgia de teste com um WhatsApp seu.
2. Você deve receber a mensagem com código + link.
3. Acesse o portal, inicie a assinatura → deve chegar o link de assinatura.

## Custo

Cloud API oficial: **1.000 conversas de serviço/mês grátis**. Acima disso, centavos por
conversa. Para o volume de termos do hospital, tende a ficar dentro do grátis.
