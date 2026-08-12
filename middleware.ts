import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Protege a área do médico. Enquanto o Supabase não estiver configurado,
 * o app segue em modo demonstração (acesso liberado). Com credenciais,
 * exige sessão autenticada para tudo em /medico (exceto /medico/login).
 */
export async function middleware(request: NextRequest) {
  if (!SUPABASE_CONFIGURADO) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const ehLogin = path === "/medico/login";
  const protegido = path.startsWith("/medico") && !ehLogin;

  if (protegido && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/medico/login";
    url.searchParams.set("redir", path);
    return NextResponse.redirect(url);
  }
  if (ehLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/medico";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/medico/:path*"],
};
