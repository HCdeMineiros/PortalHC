/**
 * Constantes de marca do Portal HC — Hospital das Clínicas de Mineiros/GO.
 * Fonte única de verdade para identidade visual e dados institucionais.
 */

export const HOSPITAL = {
  nome: "Hospital das Clínicas de Mineiros",
  nomeCurto: "Portal HC",
  cidade: "Mineiros-GO",
  endereco: "Rua Elias Carrijo Machado, Qd 02, Lt 01 — Bairro Machado",
  cep: "75830-144",
  telefones: ["(64) 3672-7282", "(64) 99959-1986"],
  dominio: "www.portalhc.com.br",
  logo: "/brand/logo-hc.png",
  rodape: "/brand/rodape-hc.png",
} as const;

export const CORES = {
  vermelho: "#E11D2A",
  vermelhoRico: "#C8102E",
  vermelhoProfundo: "#A00C22",
  dourado: "#C9A227",
  grafite: "#1A1616",
  creme: "#FAF7F3",
} as const;
