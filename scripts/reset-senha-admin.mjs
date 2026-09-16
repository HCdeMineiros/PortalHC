/**
 * Redefine a senha de um usuário do Portal HC (Supabase Auth).
 * Uso pontual, executado localmente. Lê os valores do arquivo .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL      (já existe)
 *   SUPABASE_SERVICE_ROLE_KEY     (adicionar temporariamente — copiar do Vercel)
 *   NOVA_SENHA_ADMIN              (adicionar temporariamente — a senha nova, >= 6 caracteres)
 *   EMAIL_ADMIN                   (opcional; padrão hcdemineiros@gmail.com)
 *
 * Depois de rodar com sucesso, REMOVA as linhas SUPABASE_SERVICE_ROLE_KEY e
 * NOVA_SENHA_ADMIN do .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// carrega .env.local sem dependências extras
const env = {};
try {
  for (const linha of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("Não achei o arquivo .env.local.");
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const novaSenha = env.NOVA_SENHA_ADMIN;
const email = (env.EMAIL_ADMIN || "hcdemineiros@gmail.com").toLowerCase();

if (!url) { console.error("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local."); process.exit(1); }
if (!key) { console.error("Falta SUPABASE_SERVICE_ROLE_KEY no .env.local (copie do Vercel)."); process.exit(1); }
if (!novaSenha || novaSenha.length < 6) { console.error("Falta NOVA_SENHA_ADMIN no .env.local (mínimo 6 caracteres)."); process.exit(1); }

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// procura o usuário pelo e-mail (paginando, caso haja muitos)
let alvo = null;
for (let page = 1; page <= 20 && !alvo; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error("Erro ao listar usuários:", error.message); process.exit(1); }
  alvo = data.users.find((u) => (u.email || "").toLowerCase() === email);
  if (data.users.length < 200) break;
}

if (!alvo) { console.error(`Usuário ${email} não encontrado no Supabase Auth.`); process.exit(1); }

const { error } = await admin.auth.admin.updateUserById(alvo.id, { password: novaSenha });
if (error) { console.error("Falha ao redefinir a senha:", error.message); process.exit(1); }

console.log(`✅ Senha redefinida com sucesso para ${email}.`);
console.log("Agora remova SUPABASE_SERVICE_ROLE_KEY e NOVA_SENHA_ADMIN do .env.local.");
