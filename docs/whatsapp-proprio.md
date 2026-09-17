# Nosso WhatsApp — WhatsApp Cloud API (conta do Dr. Denis)

Envio pelo número do hospital **(64) 99928-2850** via **WhatsApp Cloud API oficial (Meta)**,
chamada **direto** pelo backend do Portal HC (sem n8n).

> **Por que na conta do Denis:** a verificação do CNPJ do hospital deu conflito na Meta
> (o hospital já tinha conta de anúncios separada). Solução: hospedar sob o portfólio
> **verificado** "Denis Carvalho Advocacia". Nome de exibição do WhatsApp = "Hospital das
> Clínicas de Mineiros" (aprovado à parte). Dados dos pacientes seguem no Portal HC.

## Estado (2026-09-17)

- App: **Portal HC Mensagens** (developers.facebook.com, sob "Denis Carvalho Advocacia").
- WABA: **1844073197006036** · Número **+55 64 99928-2850** · Phone Number ID **1322801954248493**.
- Portfólio **verificado** ✅ · Pagamento (cartão) **adicionado** ✅ · Limites de mensagem definidos ✅.
- ⏳ **Número: "Não verificado"** — o registro (SMS/ligação) está com **bloqueio temporário** da Meta
  ("tente mais tarde"), provável resquício da conta antiga do hospital. **Plano: aguardar horas/1 dia
  e clicar "Registrar" de novo** (developers.facebook.com → app → Etapa 2 → Registrar).

## Código (pronto)

`lib/notifications/whatsapp.ts` já chama a Cloud API direto (`graph.facebook.com`), no-op se
as env não estiverem setadas. Usado por `cadastrar-cirurgia` (`enviarCodigoWhatsapp`) e
`iniciar-assinatura` (`enviarLinkAssinaturaWhatsapp`).

## Retomar quando o número registrar

1. **Registrar o número** (Etapa 2 → Registrar → verificar por **Ligação** → criar PIN).
2. **Criar os modelos** (WhatsApp Manager → Modelos):
   - `hc_aviso` (**Utilidade**, pt_BR) — 2 variáveis: "Olá {{1}}! Seus documentos do procedimento {{2}} no Hospital das Clínicas de Mineiros já estão disponíveis. Acesse www.portalhc.com.br/paciente/acesso."
   - `hc_codigo` (**Autenticação**, pt_BR, "Copiar código") — entrega o código (opcional; ver `WHATSAPP_TEMPLATE_CODIGO`).
   - `hc_assinatura` (**Utilidade**, opcional) — 3 variáveis: nome, título, link de assinatura.
3. **Gerar token permanente** (Business Settings → Usuários → Usuário do sistema → permissões `whatsapp_business_messaging` + `whatsapp_business_management`).
4. **Vercel → Environment Variables** + Redeploy:
   - `WHATSAPP_TOKEN` = token permanente
   - `WHATSAPP_PHONE_NUMBER_ID` = `1322801954248493` (confirmar; muda se recadastrar o número)
   - `WHATSAPP_API_VERSION` = `v21.0`
   - `WHATSAPP_TEMPLATE_LANG` = `pt_BR`
   - `WHATSAPP_TEMPLATE_AVISO` = `hc_aviso`
   - `WHATSAPP_TEMPLATE_CODIGO` = `hc_codigo` (se criado)
   - `WHATSAPP_TEMPLATE_ASSINATURA` = `hc_assinatura` (se criado)
   - `NEXT_PUBLIC_APP_URL` = `https://www.portalhc.com.br`
5. **Testar**: cadastrar cirurgia de teste com um WhatsApp → paciente recebe aviso+link (e código).

## Custo
1.000 conversas de serviço/mês grátis; acima disso, centavos por conversa.
