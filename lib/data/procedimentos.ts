// GERADO automaticamente por scripts/gerar-catalogo.mjs — não editar à mão.
// Fonte: "TABELA - CIRURGIAS, DIÁRIAS2 - ATUALIZADA.xlsx" · aba "CIRURGIAS - ATUALIZADAS 2".

export interface ComponentesValor {
  cirurgiao: number;
  auxiliar1: number;
  auxiliar2: number;
  anestesista: number;
  pediatra: number;
  exRnVideo: number;
  taxaSala: number;
}

export interface Procedimento {
  codigo: string;
  nome: string;
  /** valor total em centavos (particular) */
  valorTotalCentavos: number;
  componentesCentavos: ComponentesValor;
}

/** Versão vigente da tabela de preços (para o versionamento no banco). */
export const TABELA_VERSAO = "Atualizada 2 (2026)";
export const TABELA_MOEDA = "BRL";

export const PROCEDIMENTOS: Procedimento[] = [
  {
    "codigo": "P001",
    "nome": "APENDICECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P002",
    "nome": "APENDICECTOMIA POR VIDEO",
    "componentesCentavos": {
      "cirurgiao": 440000,
      "auxiliar1": 132000,
      "auxiliar2": 0,
      "anestesista": 132000,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 264000
    },
    "valorTotalCentavos": 1056000
  },
  {
    "codigo": "P003",
    "nome": "BIÓPSIA PROSTATA",
    "componentesCentavos": {
      "cirurgiao": 88000,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 26400,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 60000
    },
    "valorTotalCentavos": 174400
  },
  {
    "codigo": "P004",
    "nome": "CESARIANA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 77000,
      "exRnVideo": 33000,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 594000
  },
  {
    "codigo": "P005",
    "nome": "CISTOLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P006",
    "nome": "COLECISTECTOMIA (ABERTA)",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 484000
  },
  {
    "codigo": "P007",
    "nome": "CURETAGEM UTERINA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 33000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 209000
  },
  {
    "codigo": "P008",
    "nome": "HERNIA INGUINAL UNILATERAL",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P009",
    "nome": "HERNIA INGUINAL BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 440000,
      "auxiliar1": 132000,
      "auxiliar2": 0,
      "anestesista": 132000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 264000
    },
    "valorTotalCentavos": 968000
  },
  {
    "codigo": "P010",
    "nome": "HERNIA INGUINAL RN",
    "componentesCentavos": {
      "cirurgiao": 550000,
      "auxiliar1": 165000,
      "auxiliar2": 0,
      "anestesista": 165000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 330000
    },
    "valorTotalCentavos": 1210000
  },
  {
    "codigo": "P011",
    "nome": "HERNIA UMBILICAL",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 484000
  },
  {
    "codigo": "P012",
    "nome": "HIDROCELE BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P013",
    "nome": "HISTERECTOMIA TOTAL ABDOMINAL - HTA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 49500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 99000
    },
    "valorTotalCentavos": 363000
  },
  {
    "codigo": "P014",
    "nome": "HISTERECTOMIA TOTAL VAGINAL - HTV",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 16500,
      "anestesista": 49500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 99000
    },
    "valorTotalCentavos": 379500
  },
  {
    "codigo": "P015",
    "nome": "HISTERECTOMIA TOTAL VAGINAL + PERÍNEO",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 22000,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 506000
  },
  {
    "codigo": "P016",
    "nome": "SALPINGECTOMIA (LIGADURA TUBÁRIA INTRA-OPERATORIA)",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 33000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 242000
  },
  {
    "codigo": "P017",
    "nome": "NEFRECTOMIA PARCIAL",
    "componentesCentavos": {
      "cirurgiao": 154000,
      "auxiliar1": 46200,
      "auxiliar2": 0,
      "anestesista": 46200,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 92400
    },
    "valorTotalCentavos": 338800
  },
  {
    "codigo": "P018",
    "nome": "NEFRECTOMIA TOTAL",
    "componentesCentavos": {
      "cirurgiao": 176000,
      "auxiliar1": 52800,
      "auxiliar2": 0,
      "anestesista": 52800,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 105600
    },
    "valorTotalCentavos": 387200
  },
  {
    "codigo": "P019",
    "nome": "NEFROLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 198000,
      "auxiliar1": 59400,
      "auxiliar2": 0,
      "anestesista": 59400,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 118800
    },
    "valorTotalCentavos": 435600
  },
  {
    "codigo": "P020",
    "nome": "NÓDULO  DE MAMA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 33000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 242000
  },
  {
    "codigo": "P021",
    "nome": "OOFORECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 154000,
      "auxiliar1": 46200,
      "auxiliar2": 0,
      "anestesista": 46200,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 92400
    },
    "valorTotalCentavos": 338800
  },
  {
    "codigo": "P022",
    "nome": "ORQUIDOPEXIA BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P023",
    "nome": "PARTO NORMAL",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 77000,
      "exRnVideo": 33000,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 462000
  },
  {
    "codigo": "P024",
    "nome": "COLPOPERINEOPLASTIA (PERÍNEO)",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 49500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 99000
    },
    "valorTotalCentavos": 363000
  },
  {
    "codigo": "P025",
    "nome": "PIELOLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 49500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 99000
    },
    "valorTotalCentavos": 363000
  },
  {
    "codigo": "P026",
    "nome": "POSTECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 33000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 242000
  },
  {
    "codigo": "P027",
    "nome": "PTV - PROSTATECTOMIA TRANSVESICAL (CÉU ABERTO)",
    "componentesCentavos": {
      "cirurgiao": 176000,
      "auxiliar1": 52800,
      "auxiliar2": 0,
      "anestesista": 52800,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 105600
    },
    "valorTotalCentavos": 387200
  },
  {
    "codigo": "P028",
    "nome": "RTU DE PROTATA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 572000
  },
  {
    "codigo": "P029",
    "nome": "SALPINGECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P030",
    "nome": "TORÇÃO TESTICULAR",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P031",
    "nome": "TUMOR VESICAL ENDOSCÓPICO - RTU BEXIGA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P032",
    "nome": "URETEROLITOTOMIA ENDOSCÓPICA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P033",
    "nome": "URETROTOMIA INTERNA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P034",
    "nome": "VARICOCELE BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P035",
    "nome": "VARIZES 1 PERNA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P036",
    "nome": "VARIZES 1 PERNA C/ INSUF. VENOSA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 49500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 99000
    },
    "valorTotalCentavos": 363000
  },
  {
    "codigo": "P037",
    "nome": "VARIZES 2 PERNAS",
    "componentesCentavos": {
      "cirurgiao": 264000,
      "auxiliar1": 79200,
      "auxiliar2": 0,
      "anestesista": 79200,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 158400
    },
    "valorTotalCentavos": 580800
  },
  {
    "codigo": "P038",
    "nome": "VARIZES 2 PERNAS C/ INSUF. VENOSA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P039",
    "nome": "VASECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 209000
  },
  {
    "codigo": "P040",
    "nome": "VIDEOCOLECISTECTOMIA (VESÍCULA VIDEO)",
    "componentesCentavos": {
      "cirurgiao": 495000,
      "auxiliar1": 148500,
      "auxiliar2": 0,
      "anestesista": 148500,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 297000
    },
    "valorTotalCentavos": 1177000
  },
  {
    "codigo": "P041",
    "nome": "HEMORROIDECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 484000
  },
  {
    "codigo": "P042",
    "nome": "HISTEROSCOPIA",
    "componentesCentavos": {
      "cirurgiao": 150000,
      "auxiliar1": 45000,
      "auxiliar2": 0,
      "anestesista": 45000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 90000
    },
    "valorTotalCentavos": 330000
  },
  {
    "codigo": "P043",
    "nome": "DIU COM SEDAÇÃO",
    "componentesCentavos": {
      "cirurgiao": 70000,
      "auxiliar1": 21000,
      "auxiliar2": 0,
      "anestesista": 21000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 42000
    },
    "valorTotalCentavos": 154000
  },
  {
    "codigo": "P044",
    "nome": "HERNIA ENCARCERADA SEM RESSECÇÃO + INCISIONAL",
    "componentesCentavos": {
      "cirurgiao": 440000,
      "auxiliar1": 132000,
      "auxiliar2": 0,
      "anestesista": 132000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 264000
    },
    "valorTotalCentavos": 968000
  },
  {
    "codigo": "P045",
    "nome": "HERNIA INCISIONAL",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P046",
    "nome": "HERNIA ENCARCERADA SEM RESSECÇÃO",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P047",
    "nome": "HERNIA ENCARCERADA COM RESSECÇÃO",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P048",
    "nome": "CERARIANA COM LAQUEADURA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 77000,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 803000
  },
  {
    "codigo": "P049",
    "nome": "ORQUIECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P050",
    "nome": "ORQUIDOPEXIA UNILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 39600,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 79200
    },
    "valorTotalCentavos": 290400
  },
  {
    "codigo": "P051",
    "nome": "REVERSÃO DE VASECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 726000
  },
  {
    "codigo": "P052",
    "nome": "CONIZAÇÃO",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 33000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 242000
  },
  {
    "codigo": "P053",
    "nome": "AMIGDALECTOMIA + ADENOIDECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P054",
    "nome": "LOMBOTOMIA EXPLORADORA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P055",
    "nome": "RECONSTRUÇÃO LCA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P056",
    "nome": "RECONSTRUÇÃO LCA COM MENISCECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P057",
    "nome": "HERNIA INGUINAL E UMBILICAL",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P058",
    "nome": "ADENOIDECTOMIA + TURBINECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P059",
    "nome": "CERCLAGEM CERVICAL",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P060",
    "nome": "SEPTOPLASTIA + TURBINECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P061",
    "nome": "HERNIA EPIGÁTRICA",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  },
  {
    "codigo": "P062",
    "nome": "FRENECTOMIA ORAL",
    "componentesCentavos": {
      "cirurgiao": 0,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 0
    },
    "valorTotalCentavos": 0
  }
];
