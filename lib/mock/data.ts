/**
 * Dados FICTÍCIOS para demonstração da fatia 5 (paciente lê/assina termos e dá OK).
 * NENHUM dado real de paciente. Os TERMOS agora usam o conteúdo jurídico REAL,
 * extraído dos .docx do hospital (lib/data/termos.ts). Os informativos (LGPD/visitas)
 * ainda usam resumo — o texto oficial virá da extração dos PDFs.
 */
import { TERMOS } from "@/lib/data/termos";
import { INFORMATIVOS } from "@/lib/data/informativos";

export type ItemTipo = "termo_consentimento" | "documento_informativo";
export type ItemStatus = "pendente" | "assinado" | "ok_dado";

export interface ItemDocumento {
  id: string;
  tipo: ItemTipo;
  titulo: string;
  subtitulo: string;
  versao: string;
  corpo: string[];
  status: ItemStatus;
}

export interface SolicitacaoDemo {
  numero: string;
  paciente: {
    nome: string;
    cpfMascarado: string;
    dataNascimento: string;
    whatsapp: string;
  };
  medico: string;
  procedimento: string;
  valorTotal: string;
  dataPrevista: string;
  itens: ItemDocumento[];
}

/** Busca o corpo real de um termo pelo seu chave no registro. */
function corpoDoTermo(chave: string): string[] {
  const t = TERMOS.find((x) => x.chave === chave);
  return t ? t.corpo : ["(termo não encontrado no registro)"];
}

/** Busca o corpo real de um documento informativo (PDF) pelo seu chave. */
function corpoDoInformativo(chave: string): string[] {
  const d = INFORMATIVOS.find((x) => x.chave === chave);
  return d ? d.corpo : ["(documento não encontrado no registro)"];
}

export const SOLICITACAO_DEMO: SolicitacaoDemo = {
  numero: "HC-2026-000481",
  paciente: {
    nome: "Maria Aparecida de Souza",
    cpfMascarado: "***.456.789-**",
    dataNascimento: "1979-03-14",
    whatsapp: "(64) 9•••-4521",
  },
  medico: "Dr. João Ribeiro (CRM-GO 12345)",
  procedimento: "Videocolecistectomia (retirada da vesícula por vídeo)",
  valorTotal: "R$ 9.570,00",
  dataPrevista: "2026-08-22",
  itens: [
    {
      id: "tcle-videocolecistectomia",
      tipo: "termo_consentimento",
      titulo: "Termo de Consentimento Livre e Esclarecido",
      subtitulo: "Colecistectomia Videolaparoscópica",
      versao: "v1.0",
      status: "pendente",
      corpo: corpoDoTermo("TCLE_40_VIDEOCOLECISTECTOMIA"),
    },
    {
      id: "termo-anestesia",
      tipo: "termo_consentimento",
      titulo: "Termo de Consentimento — Anestesia",
      subtitulo: "Avaliação e ato anestésico",
      versao: "v1.0",
      status: "pendente",
      corpo: corpoDoTermo("TCLE_45_ANESTESIA"),
    },
    {
      id: "doc-lgpd",
      tipo: "documento_informativo",
      titulo: "Aviso de Privacidade (LGPD)",
      subtitulo: "Tratamento de dados pessoais e sensíveis",
      versao: "v1.0",
      status: "pendente",
      corpo: [
        "O Hospital das Clínicas de Mineiros trata seus dados pessoais e de saúde para a finalidade de prestação de assistência à saúde, com base legal na tutela da saúde (LGPD, art. 11), adotando medidas de segurança e confidencialidade.",
        "Você tem direitos garantidos pela LGPD, como acesso, correção e informação sobre o tratamento dos seus dados, que podem ser exercidos junto ao Encarregado (DPO) da instituição.",
        "Ao prosseguir, você confirma que leu e está ciente deste aviso. (Resumo — o texto oficial virá do PDF institucional.)",
      ],
    },
    {
      id: "doc-visitas",
      tipo: "documento_informativo",
      titulo: "Orientações sobre Visitas e Acompanhantes",
      subtitulo: "Horários, regras e higiene",
      versao: "v1.0",
      status: "pendente",
      corpo: corpoDoInformativo("DOC_ORIENTACAO_VISITAS"),
    },
    {
      id: "doc-direitos",
      tipo: "documento_informativo",
      titulo: "Direitos do Paciente",
      subtitulo: "Seus direitos e deveres na internação",
      versao: "v1.0",
      status: "pendente",
      corpo: corpoDoInformativo("DOC_DIREITOS_PACIENTE"),
    },
  ],
};
