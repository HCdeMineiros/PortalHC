# Portal HC — Plano da Fase 1 (MVP)

> **Status:** aguardando aprovação do Dr. Denis antes do scaffolding de código.
> **Domínio:** www.portalhc.com.br · **Instituição:** Hospital das Clínicas de Mineiros/GO
> **Escopo:** internação e cirurgia de pacientes **PARTICULARES**, sistema autônomo (sem integração PROMEDICO nesta fase).

---

## 1. Visão em uma frase

Um portal web (PWA instalável) onde o **médico cadastra a cirurgia** a partir de um banco de procedimentos com valores, o **paciente particular** recebe por WhatsApp um link seguro, **lê e assina eletronicamente** os Termos de Consentimento (com força probatória — Lei 14.063/2020), **dá "OK" aos documentos informativos** (LGPD, direitos, visitas etc.), e a **Internação libera a admissão** com trilha de auditoria completa.

## 2. Stack (já decidida no prompt)

| Camada | Escolha |
|---|---|
| Aplicação | Next.js (App Router) + TypeScript — monólito full-stack |
| Dados/Auth/Storage | Supabase (região São Paulo `sa-east-1`), Postgres + RLS + Storage privado |
| UI | Tailwind CSS + shadcn/ui, responsivo, **PWA** |
| PDF | Geração no servidor (HTML → PDF) |
| Notificação | Interface `NotificationService` → WhatsApp (Meta API **ou** n8n) |
| Assinatura | Interface `SignatureProvider` → assinatura eletrônica avançada própria (upgrade futuro p/ Gov.br/ICP) |
| Repositório | Git privado no GitHub, CI rodando testes |

> Observação de ambiente: **Docker não está instalado** nesta máquina. Para o MVP **não é obrigatório** — desenvolvemos com Node local e o Supabase em nuvem. Deixo o `Dockerfile`/`docker-compose` prontos no repositório para quando você quiser padronizar homolog/produção, mas não bloqueia o início.

## 3. Identidade visual (padrão do sistema)

- **Logo:** "H" vermelho sobre oval prateado (`assets/brand/logo-hc.png`).
- **Cores:** vermelho como cor primária (base da marca) + acabamento **luxuoso** com dourado/champanhe suave, cinza-grafite para textos e off-white para fundos.
  - Vermelho HC (primário): `#E11D2A` (aprox. do logo — ajustaremos com o arquivo vetorial/alta resolução).
  - Dourado (acento luxo): `#C9A227`.
  - Grafite (texto): `#1E1E1E`. · Prata (superfícies): `#EDEDED`. · Off-white (fundo): `#FAFAFA`.
- **Tom:** limpo, elegante, com bastante respiro, tipografia serifada nos títulos (sofisticação) + sans no corpo (legibilidade). Cartões com sombra suave e detalhes dourados discretos.
- **Endereço/rodapé oficial:** Rua Elias Carrijo Machado, Qd 02, Lt 01 – Bairro Machado – CEP 75830-144 – Mineiros-GO · (64) 3672-7282 / (64) 99959-1986.

## 4. Fatias verticais (ordem recomendada)

Cada fatia vai do banco à tela, com testes. Ordem pensada para você **ver valor cedo** e para a peça jurídica (assinatura) ficar sólida.

1. **Fundação & Segurança** — projeto Next.js, Supabase conectado, Auth de colaboradores com **MFA**, papéis (RBAC), **RLS** base, tabela de **auditoria imutável**, layout/tema HC (vermelho/luxo), PWA base. *Sem dado real.*
2. **Catálogo de Procedimentos & Valores** — importar a planilha "TABELA - CIRURGIAS, DIÁRIAS" para uma tabela de preços **versionada**; tela da Administração/DPO para gerir procedimentos e valores.
3. **Cadastro de Paciente + Solicitação de Internação** — o médico cria a solicitação (paciente + procedimento + data prevista); máquina de estados; reserva de campo de referência externa (futuro PROMEDICO).
4. **Modelos de Termo versionados + Geração** — carregar os Termos de Consentimento (pasta HCM, ultrassom, declarações) como **templates versionados** com variáveis; gerar o documento da solicitação.
5. **★ Acesso do Paciente + Assinatura Eletrônica + "OK" dos documentos** — *(fatia central que você destacou)*: link seguro por WhatsApp, duplo fator (CPF + nascimento + OTP), leitura dos termos, **aceite e assinatura**, **OK** aos documentos informativos, geração do **PDF assinado com trilha/QR**.
6. **Entrega via WhatsApp** — `NotificationService`: envia link, OTP e aviso de termo disponível (Meta API ou n8n).
7. **Internação: "OK digital" / Liberação para admissão** — painel da Internação vê previstos, documentos, termos assinados, pendências e **libera a admissão**; verificação pública por código/hash.

> As fatias 5 e 7 são o coração do que você pediu ("no local da internação, o paciente assina os termos e dá OK aos documentos"). As fatias 1–4 são a fundação mínima para elas funcionarem com segurança.

## 5. Estrutura de pastas proposta

```
portalhc/
├─ app/                      # Next.js App Router (UI + rotas API)
│  ├─ (colaborador)/         # área interna: admin, médico, internação
│  ├─ (paciente)/            # área do paciente (duplo fator + assinatura)
│  ├─ verificar/             # página pública de verificação por código/hash
│  └─ api/                   # Route Handlers (webhooks, PDF, OTP)
├─ components/               # UI (shadcn/ui) + tema HC
├─ lib/
│  ├─ supabase/              # clientes (browser/server/service-role isolado)
│  ├─ signature/             # SignatureProvider (assinatura avançada)
│  ├─ notifications/         # NotificationService (WhatsApp: Meta | n8n)
│  ├─ pdf/                   # geração de PDF + página de trilha/QR
│  └─ audit/                 # gravação de auditoria
├─ supabase/
│  ├─ migrations/            # SQL de tabelas + políticas RLS
│  └─ seed/                  # dados fictícios (nunca reais)
├─ public/                   # PWA (manifest, service worker, ícones, logo)
├─ assets/brand/             # logos e material de marca (fonte)
├─ docs/                     # este plano, modelo de dados, ADRs, LGPD
├─ tests/                    # testes automatizados (CI)
├─ .env.example              # segredos SEM valores reais
├─ CLAUDE.md · README.md
└─ Dockerfile · docker-compose.yml  (prontos, uso opcional)
```

## 6. Ambientes e forma de trabalho

- Três ambientes: **dev / homolog / produção**; nunca desenvolver sobre dados reais (usar seed fictício).
- **Conventional commits**, PRs pequenos, **CI executando testes** antes de merge.
- Nada de ação irreversível (publicar, DNS, produção) sem seu aval.

---

Ver também: [`01_MODELO_DADOS.md`](01_MODELO_DADOS.md) · [`02_MAQUINA_ESTADOS.md`](02_MAQUINA_ESTADOS.md) · [`03_ASSINATURA_ELETRONICA.md`](03_ASSINATURA_ELETRONICA.md) · [`04_SEGREDOS_E_AMBIENTE.md`](04_SEGREDOS_E_AMBIENTE.md) · [`05_PERGUNTAS_ABERTAS.md`](05_PERGUNTAS_ABERTAS.md)
