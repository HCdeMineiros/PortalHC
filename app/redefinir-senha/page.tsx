"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/Logo";
import { RodapeEscuro } from "@/components/brand/RodapeEscuro";
import { FundoEscuro } from "@/components/brand/FundoEscuro";
import { CampoSenha } from "@/components/brand/CampoSenha";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Redefinir senha — o usuário chega aqui pelo link enviado por e-mail.
 * Um cliente dedicado com detectSessionInUrl:true lê o token de recuperação
 * do link e abre uma sessão temporária (só em memória) para permitir a troca.
 */
type Estado = "carregando" | "pronto" | "invalido" | "sucesso" | "semconfig";

export default function RedefinirSenha() {
  const router = useRouter();
  const clientRef = useRef<SupabaseClient | null>(null);
  const [estado, setEstado] = useState<Estado>("carregando");
  const [novaSenha, setNovaSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) {
      setEstado("semconfig");
      return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: true, flowType: "implicit" },
    });
    clientRef.current = supabase;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setEstado((e) => (e === "sucesso" ? e : "pronto"));
    });

    // fallback: se em ~3s não houver sessão de recuperação, o link é inválido/expirado
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setEstado((e) => (e === "carregando" ? (data.session ? "pronto" : "invalido") : e));
    }, 3000);

    return () => {
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (novaSenha.length < 6) return setErro("A nova senha deve ter ao menos 6 caracteres.");
    if (novaSenha !== confSenha) return setErro("A confirmação da nova senha não confere.");
    const supabase = clientRef.current;
    if (!supabase) return setErro("Sessão de recuperação não encontrada. Solicite um novo link.");
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) {
        setErro("Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo.");
        return;
      }
      await supabase.auth.signOut().catch(() => {});
      setEstado("sucesso");
      setTimeout(() => router.push("/medico/login"), 2500);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <FundoEscuro />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo height={64} variant="light" /></Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="hcx-card-d hcx-fade p-8">
          <span className="hcx-badge-d">Acesso · Redefinir senha</span>

          {estado === "carregando" && (
            <p className="mt-6 text-sm text-hc-navy-soft">Verificando o link…</p>
          )}

          {estado === "semconfig" && (
            <p className="mt-6 text-sm text-[#FF9BA3]">
              Login em preparação — o banco de dados ainda está sendo configurado.
            </p>
          )}

          {estado === "invalido" && (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Link inválido ou expirado</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Este link de redefinição não é mais válido. Solicite um novo.
              </p>
              <Link href="/recuperar-senha" className="hcx-btn-cy mt-6 inline-block w-full text-center">
                Solicitar novo link
              </Link>
            </>
          )}

          {estado === "sucesso" && (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Senha redefinida! ✅</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Sua nova senha foi salva. Redirecionando para o login…
              </p>
              <Link href="/medico/login" className="hcx-btn-cy mt-6 inline-block w-full text-center">
                Ir para o login
              </Link>
            </>
          )}

          {estado === "pronto" && (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-hc-navy-ink">Criar nova senha</h1>
              <p className="mt-2 text-sm text-hc-navy-soft">
                Defina sua nova senha (mínimo 6 caracteres).
              </p>
              <form onSubmit={salvar} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">Nova senha</label>
                  <CampoSenha
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Nova senha"
                    autoComplete="new-password"
                    autoFocus
                    tone="escuro"
                    className="hcx-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-hc-navy-ink">Confirmar nova senha</label>
                  <CampoSenha
                    value={confSenha}
                    onChange={(e) => setConfSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    tone="escuro"
                    className="hcx-field"
                  />
                </div>
                {erro && <p className="text-sm text-[#FF9BA3]">{erro}</p>}
                <button type="submit" disabled={salvando} className="hcx-btn-cy w-full">
                  {salvando ? "Salvando…" : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <RodapeEscuro />
    </>
  );
}
