# Portal HC — Perguntas em Aberto (item 12.6 / 13 do prompt)

Vou perguntando poucas por vez. As **bloqueantes** para começar o scaffolding estão marcadas com ★.

## Bloqueantes agora
1. ★ **WhatsApp:** começamos pela **Meta Cloud API oficial** ou pelo seu **n8n existente** (webhook)? (Podemos deixar o outro plugável.)
2. ★ **Supabase:** você já tem conta/projeto ou quer que eu prepare tudo com um Supabase de **desenvolvimento** enquanto você cria o oficial em São Paulo?
3. ★ **Ponto de partida do produto:** confirmo que a **primeira fatia visível** que você quer ver funcionando é a **tela do paciente lendo/assinando os termos e dando OK aos documentos** (fatia 5), mesmo que eu use dados fictícios nas fatias 1–4 para chegar lá?

## Próximas (não bloqueiam o início)
4. **Procedimentos e valores:** quais entram primeiro? (Uso a planilha "TABELA - CIRURGIAS, DIÁRIAS" como base — confirma?)
5. **Desconto:** quem pode conceder desconto sobre o valor de tabela? (só admin/DPO? médico também?)
6. **Autorizações além do TCLE:** além dos 65 termos cirúrgicos + ultrassom + declaração de inequívoco conhecimento, há outros que **exigem assinatura**? E quais são apenas **"OK/ciência"** (LGPD, visitas, direitos, vestimenta, surto)?
7. **Texto-base oficial dos termos:** posso extrair o conteúdo dos `.docx`/`.pdf` das pastas e transformá-los em templates, certo? Há uma versão "oficial vigente" de cada?
8. **Dados mínimos do paciente:** nome, CPF, nascimento, WhatsApp, e-mail — falta algo essencial (nome da mãe? endereço? convênio=não, pois é particular)?
9. **Assinatura desenhada:** quer oferecer o campo de desenhar a assinatura (além do aceite + nome digitado) já no MVP?
10. **Geolocalização:** captamos a geolocalização opcional do paciente no aceite (com consentimento) ou deixamos desligado por ora?

> O prompt já avisa que **haverá muitas mudanças** ao longo da construção — então vamos iterando.
