# Portal HC — Assinatura Eletrônica e Valor Probatório

Núcleo jurídico do sistema. Implementação de **assinatura eletrônica avançada** (Lei 14.063/2020), atrás da interface `SignatureProvider` (para futura troca por Gov.br / ZapSign / Clicksign / D4Sign → assinatura qualificada ICP-Brasil).

## Fluxo do paciente (fatia 5)
1. **Identificação:** CPF + data de nascimento + **código OTP** (WhatsApp/e-mail). Nunca só CPF.
2. **Exibição do termo na versão controlada** — registra qual `modelos_termo.versao` foi assinada.
3. **Ato de aceite explícito:** checkbox "Li e concordo" + nome completo digitado + (opcional) assinatura desenhada.
4. **Captura de evidências:**
   - carimbo de tempo do **servidor** (fonte confiável);
   - **IP** e **user-agent**;
   - **geolocalização** opcional, só com consentimento;
   - **hash SHA-256** do conteúdo exato do documento.
5. **PDF final assinado** com página extra de **"Trilha de Auditoria / Assinaturas"**: todas as evidências + hash + **código e QR de verificação**.
6. **Verificação pública** por código/hash (`/verificar`) que confirma autenticidade **sem expor dados pessoais**.
7. **Armazenamento imutável** (sem sobrescrita) em bucket privado + registro em banco com o hash.

## "OK" de documentos informativos
Documentos que **não exigem assinatura**, mas exigem **ciência** (ex.: LGPD, Orientação sobre Visitas, Direitos do Paciente, Código de Vestimenta): paciente clica **"Li e estou ciente"** → grava `oks_documento` com timestamp/IP/user-agent. Também entra na trilha de auditoria.

## Documentos-fonte já disponíveis (pastas do Dr. Denis)
- **Termos de Consentimento (assinatura):** 65 termos cirúrgicos em `Termos_de_Consentimento_HCM/` (01 a 65), 2 de ultrassom transvaginal (adultas/menores), `Declaração de Inequívoco Conhecimento e Concordância`.
- **Documentos informativos (OK/ciência):** `PROJETO LGPD`, `Orientação sobre Visitas`, `direitos.pdf` (direitos do paciente), `colono.pdf`, `Termo_Codigo_Vestimenta_Resumido`, `Protocolo de Surto Hospitalar`.
- **Catálogo/valores:** `TABELA - CIRURGIAS, DIÁRIAS.xlsx`.

> Na fatia 4 esses arquivos viram **templates versionados com variáveis**. Antes disso, preciso confirmar com você o texto-base oficial de cada um (item de perguntas).
