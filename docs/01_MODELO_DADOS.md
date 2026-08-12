# Portal HC — Modelo de Dados (Fase 1) + RLS

> Texto para validação **antes** de gerar as migrations. Nomes em português quando faz sentido. Todo dado de saúde é tratado como **dado pessoal sensível** (LGPD art. 11).

## Entidades

### `usuarios` (colaboradores)
- id (uuid, = auth.users.id), nome, email, telefone, papel (enum), ativo, mfa_habilitado, criado_em.
- **Papéis (enum `papel`):** `admin_dpo`, `medico`, `internacao`, `paciente`, e previstos-sem-tela: `faturamento`, `enfermagem`.

### `medicos`
- id, usuario_id (fk, opcional — médico pode ser usuário), nome, crm, especialidade, ativo.

### `pacientes`
- id, nome, cpf (único), data_nascimento, telefone_whatsapp, email (opcional), sexo, criado_por, criado_em.
- **`ref_externa_promedico`** (texto, nulo) — reservado p/ futura integração (não usar agora).
- Identificação **sempre** por CPF **+** data de nascimento (nunca só CPF).

### `procedimentos` (catálogo)
- id, codigo, nome, descricao, ativo.

### `tabela_precos` (versionada)
- id, procedimento_id (fk), versao, valor_centavos, vigente_de, vigente_ate (nulo = vigente), criado_por.
- Preço **nunca** é editado no lugar: cria-se nova versão (trilha histórica).

### `solicitacoes` (internação/cirurgia)
- id, numero (sequencial legível), paciente_id (fk), medico_id (fk), data_prevista, status (enum — ver máquina de estados), observacoes, criado_por, criado_em, atualizado_em.
- **`ref_externa_promedico`** (reservado).

### `solicitacao_procedimentos` (N:N solicitação × procedimento)
- id, solicitacao_id (fk), procedimento_id (fk), preco_id (fk p/ versão do preço aplicada), quantidade.

### `modelos_termo` (templates versionados)
- id, chave (ex.: `TCLE_COLECISTECTOMIA`), titulo, tipo (`termo_consentimento` | `documento_informativo`), versao, corpo (com variáveis {{nome}}, {{procedimento}}…), exige_assinatura (bool), exige_ok (bool), ativo, publicado_em.

### `documentos_gerados` (instância p/ uma solicitação)
- id, solicitacao_id (fk), modelo_id (fk versão exata), paciente_id, tipo, status (`gerado` | `aguardando` | `assinado` | `ok_dado`), storage_path (bucket privado), hash_sha256, criado_em.

### `assinaturas` (pacote probatório — 1:1 com documento assinado)
- id, documento_id (fk), paciente_id, metodo (`aceite_checkbox` + nome digitado + assinatura desenhada opcional), otp_verificado (bool), carimbo_tempo_servidor, ip, user_agent, geolocalizacao (opcional/consentida), hash_documento_sha256, codigo_verificacao (curto), qr_payload, pdf_final_path, criado_em. **Imutável.**

### `oks_documento` (aceite de documentos informativos)
- id, documento_id (fk), paciente_id, carimbo_tempo_servidor, ip, user_agent, criado_em.

### `otp_codigos`
- id, paciente_id, codigo_hash, canal (`whatsapp`|`email`), expira_em, tentativas, usado_em.

### `auditoria` (log imutável — append only)
- id, ator_usuario_id (ou `paciente`), acao, entidade, entidade_id, status_anterior, status_novo, detalhe (sem dados sensíveis desnecessários), ip, user_agent, criado_em.
- Sem UPDATE/DELETE (política RLS + trigger que bloqueia alteração).

### `downloads_documento` (registro de cada acesso a arquivo)
- id, documento_id, quem (usuario/paciente), url_assinada_emitida_em, expira_em, ip, user_agent.

## Políticas de RLS por papel (resumo)

| Papel | Pode ver | Pode escrever |
|---|---|---|
| **admin_dpo** | tudo (inclusive auditoria, relatórios) | médicos, procedimentos, preços, modelos de termo, usuários, permissões |
| **medico** | **apenas** seus pacientes e solicitações | cria solicitações, confirma internação |
| **internacao** | pacientes previstos, documentos, termos assinados, pendências | libera admissão (muda status) |
| **paciente** | **apenas** a própria solicitação (via duplo fator) | preenche dados, envia documentos, assina termos, dá OK |

- `auditoria`, `assinaturas`, `oks_documento`, `documentos_gerados` → **sem UPDATE/DELETE** para ninguém (append only); leitura conforme papel.
- Operações administrativas com *service role* isoladas em código de servidor marcado; o cliente sempre usa o JWT do usuário para a RLS valer.
- Storage: buckets **privados**; acesso só por **URL assinada de curta duração**; cada emissão registrada em `downloads_documento`.
