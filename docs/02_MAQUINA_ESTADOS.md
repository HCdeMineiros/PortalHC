# Portal HC — Máquina de Estados da Solicitação de Internação

Estados e transições (status do registro `solicitacoes`):

```
rascunho
   │  (médico completa dados + procedimentos)
   ▼
aguardando_paciente ──────────────┐
   │  (paciente valida duplo fator │  cancelada (por admin/médico, com motivo)
   │   e acessa o portal)          │
   ▼                               │
documentos_pendentes  ────────────┤
   │  (todos os termos assinados   │
   │   e OKs dados)                │
   ▼                               │
termos_assinados  ─────────────────┤
   │  (Internação confere e libera)│
   ▼                               │
liberada_para_admissao ────────────┘
   │  (procedimento acontece)
   ▼
realizada
   │  (fechamento administrativo)
   ▼
encerrada
```

## Regras
- Toda transição grava em `auditoria` (status_anterior → status_novo, ator, timestamp).
- `documentos_pendentes → termos_assinados` só ocorre quando **todos** os documentos com `exige_assinatura` estão `assinado` e todos com `exige_ok` estão `ok_dado`.
- `termos_assinados → liberada_para_admissao` é a ação **"OK digital" da Internação**.
- `cancelada` exige **motivo** e é acessível a partir dos estados iniciais (não após `realizada`).
- Nenhum estado permite editar/sobrescrever documento já assinado (imutabilidade do item 8 do prompt).

## Papel responsável por cada transição
| Transição | Quem |
|---|---|
| rascunho → aguardando_paciente | médico |
| aguardando_paciente → documentos_pendentes | paciente (1º acesso via duplo fator) |
| documentos_pendentes → termos_assinados | automático (quando checklist 100%) |
| termos_assinados → liberada_para_admissao | internação |
| liberada_para_admissao → realizada | internação/médico |
| realizada → encerrada | admin/faturamento (fase futura) |
| * → cancelada | médico/admin (com motivo) |
