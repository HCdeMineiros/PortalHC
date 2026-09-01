// Configuração da integração Assinafy (assinatura eletrônica).
// As chaves ficam nas variáveis de ambiente (Vercel), nunca no código.
export const ASSINAFY_API_KEY = process.env.ASSINAFY_API_KEY || "";
export const ASSINAFY_ACCOUNT_ID = process.env.ASSINAFY_ACCOUNT_ID || "";
export const ASSINAFY_BASE_URL = process.env.ASSINAFY_BASE_URL || "https://api.assinafy.com.br/v1";
/** Token secreto exigido na URL do webhook (evita chamadas não autorizadas). */
export const ASSINAFY_WEBHOOK_TOKEN = process.env.ASSINAFY_WEBHOOK_TOKEN || "";

export const ASSINAFY_CONFIGURADO = Boolean(ASSINAFY_API_KEY && ASSINAFY_ACCOUNT_ID);
