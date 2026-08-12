// GERADO automaticamente por scripts/gerar-catalogo.mjs — não editar à mão.
// Fonte: "TABELA - CIRURGIAS, DIÁRIAS.xlsx" · aba "CIRURGIAS - PARTICULAR".

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
export const TABELA_VERSAO = "Outubro/2024";
export const TABELA_MOEDA = "BRL";

export const PROCEDIMENTOS: Procedimento[] = [
  {
    "codigo": "P001",
    "nome": "APENDICECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 165000
    },
    "valorTotalCentavos": 671000
  },
  {
    "codigo": "P002",
    "nome": "APENDICECTOMIA POR VIDEO",
    "componentesCentavos": {
      "cirurgiao": 440000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 165000,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 165000
    },
    "valorTotalCentavos": 957000
  },
  {
    "codigo": "P003",
    "nome": "BIÓPSIA PROSTATA",
    "componentesCentavos": {
      "cirurgiao": 88000,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 44000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 198000
  },
  {
    "codigo": "P004",
    "nome": "CESARIANA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 77000,
      "exRnVideo": 33000,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 638000
  },
  {
    "codigo": "P005",
    "nome": "CISTOLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P006",
    "nome": "COLECISTECTOMIA (ABERTA)",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 528000
  },
  {
    "codigo": "P007",
    "nome": "CURETAGEM UTERINA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 0,
      "auxiliar2": 0,
      "anestesista": 55000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 231000
  },
  {
    "codigo": "P008",
    "nome": "HERNIA INGUINAL UNILATERAL",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 616000
  },
  {
    "codigo": "P009",
    "nome": "HERNIA INGUINAL BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 440000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 165000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 165000
    },
    "valorTotalCentavos": 869000
  },
  {
    "codigo": "P010",
    "nome": "HERNIA INGUINAL RN",
    "componentesCentavos": {
      "cirurgiao": 550000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 170500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 165000
    },
    "valorTotalCentavos": 984500
  },
  {
    "codigo": "P011",
    "nome": "HERNIA UMBILICAL",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 82500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 462000
  },
  {
    "codigo": "P012",
    "nome": "HIDROCELE BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P013",
    "nome": "HISTERECTOMIA TOTAL ABDOMINAL - HTA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 82500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 407000
  },
  {
    "codigo": "P014",
    "nome": "HISTERECTOMIA TOTAL VAGINAL - HTV",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 16500,
      "anestesista": 82500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 423500
  },
  {
    "codigo": "P015",
    "nome": "HISTERECTOMIA TOTAL VAGINAL + PERÍNEO",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 22000,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 143000
    },
    "valorTotalCentavos": 561000
  },
  {
    "codigo": "P016",
    "nome": "SALPINGECTOMIA (LIGADURA TUBÁRIA INTRA-OPERATORIA)",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 55000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 264000
  },
  {
    "codigo": "P017",
    "nome": "NEFRECTOMIA PARCIAL",
    "componentesCentavos": {
      "cirurgiao": 154000,
      "auxiliar1": 44000,
      "auxiliar2": 0,
      "anestesista": 77000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 385000
  },
  {
    "codigo": "P018",
    "nome": "NEFRECTOMIA TOTAL",
    "componentesCentavos": {
      "cirurgiao": 176000,
      "auxiliar1": 52800,
      "auxiliar2": 0,
      "anestesista": 88000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 448800
  },
  {
    "codigo": "P019",
    "nome": "NEFROLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 198000,
      "auxiliar1": 59400,
      "auxiliar2": 0,
      "anestesista": 99000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 488400
  },
  {
    "codigo": "P020",
    "nome": "NÓDULO  DE MAMA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 55000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 264000
  },
  {
    "codigo": "P021",
    "nome": "OOFORECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 154000,
      "auxiliar1": 46200,
      "auxiliar2": 0,
      "anestesista": 77000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 387200
  },
  {
    "codigo": "P022",
    "nome": "ORQUIDOPEXIA BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
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
      "taxaSala": 110000
    },
    "valorTotalCentavos": 440000
  },
  {
    "codigo": "P024",
    "nome": "COLPOPERINEOPLASTIA (PERÍNEO)",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 82500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 407000
  },
  {
    "codigo": "P025",
    "nome": "PIELOLITOTOMIA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 49500,
      "auxiliar2": 0,
      "anestesista": 82500,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 407000
  },
  {
    "codigo": "P026",
    "nome": "POSTECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 33000,
      "auxiliar2": 0,
      "anestesista": 55000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 264000
  },
  {
    "codigo": "P027",
    "nome": "PTV - PROSTATECTOMIA TRANSVESICAL (CÉU ABERTO)",
    "componentesCentavos": {
      "cirurgiao": 176000,
      "auxiliar1": 52800,
      "auxiliar2": 0,
      "anestesista": 88000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 448800
  },
  {
    "codigo": "P028",
    "nome": "RTU DE PROTATA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 143000
    },
    "valorTotalCentavos": 627000
  },
  {
    "codigo": "P029",
    "nome": "SALPINGECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P030",
    "nome": "TORÇÃO TESTICULAR",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P031",
    "nome": "TUMOR VESICAL ENDOSCÓPICO - RTU BEXIGA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P032",
    "nome": "URETEROLITOTOMIA ENDOSCÓPICA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P033",
    "nome": "URETROTOMIA INTERNA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P034",
    "nome": "VARICOCELE BILATERAL",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P035",
    "nome": "VARIZES 1 PERNA",
    "componentesCentavos": {
      "cirurgiao": 132000,
      "auxiliar1": 39600,
      "auxiliar2": 0,
      "anestesista": 66000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 110000
    },
    "valorTotalCentavos": 347600
  },
  {
    "codigo": "P036",
    "nome": "VARIZES 1 PERNA C/ INSUF. VENOSA",
    "componentesCentavos": {
      "cirurgiao": 165000,
      "auxiliar1": 52800,
      "auxiliar2": 0,
      "anestesista": 88000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 143000
    },
    "valorTotalCentavos": 448800
  },
  {
    "codigo": "P037",
    "nome": "VARIZES 2 PERNAS",
    "componentesCentavos": {
      "cirurgiao": 264000,
      "auxiliar1": 79200,
      "auxiliar2": 0,
      "anestesista": 132000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 143000
    },
    "valorTotalCentavos": 618200
  },
  {
    "codigo": "P038",
    "nome": "VARIZES 2 PERNAS C/ INSUF. VENOSA",
    "componentesCentavos": {
      "cirurgiao": 330000,
      "auxiliar1": 99000,
      "auxiliar2": 0,
      "anestesista": 165000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 143000
    },
    "valorTotalCentavos": 737000
  },
  {
    "codigo": "P039",
    "nome": "VASECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 110000,
      "auxiliar1": 11000,
      "auxiliar2": 0,
      "anestesista": 0,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 66000
    },
    "valorTotalCentavos": 187000
  },
  {
    "codigo": "P040",
    "nome": "VIDEOCOLECISTECTOMIA (VESÍCULA VIDEO)",
    "componentesCentavos": {
      "cirurgiao": 495000,
      "auxiliar1": 115500,
      "auxiliar2": 0,
      "anestesista": 165000,
      "pediatra": 0,
      "exRnVideo": 88000,
      "taxaSala": 198000
    },
    "valorTotalCentavos": 1061500
  },
  {
    "codigo": "P041",
    "nome": "HEMORROIDECTOMIA",
    "componentesCentavos": {
      "cirurgiao": 220000,
      "auxiliar1": 66000,
      "auxiliar2": 0,
      "anestesista": 110000,
      "pediatra": 0,
      "exRnVideo": 0,
      "taxaSala": 132000
    },
    "valorTotalCentavos": 528000
  },
  {
    "codigo": "P042",
    "nome": "HISTEROSCOPIA",
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
    "codigo": "P043",
    "nome": "DIU COM SEDAÇÃO",
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
    "codigo": "P044",
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
    "codigo": "P045",
    "nome": "HERNIA ENCARCERADA SEM RESSECÇÃO + INCISIONAL",
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
    "codigo": "P046",
    "nome": "HERNIA INCISIONAL",
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
    "codigo": "P047",
    "nome": "HERNIA ENCARCERADA SEM RESSECÇÃO",
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
    "codigo": "P048",
    "nome": "HERNIA ENCARCERADA COM RESSECÇÃO",
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
    "codigo": "P049",
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
    "codigo": "P050",
    "nome": "CERARIANA COM LAQUEADURA",
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
    "codigo": "P051",
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
    "codigo": "P052",
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
    "codigo": "P053",
    "nome": "ORQUIECTOMIA",
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
    "codigo": "P055",
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
    "codigo": "P056",
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
    "codigo": "P057",
    "nome": "ORQUIDOPEXIA UNILATERAL",
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
    "codigo": "P059",
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
    "codigo": "P060",
    "nome": "REVERSÃO DE VASECTOMIA",
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
    "nome": "CONIZAÇÃO",
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
