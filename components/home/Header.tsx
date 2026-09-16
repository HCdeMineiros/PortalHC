import Link from "next/link";
import Image from "next/image";

/**
 * Cabeçalho da home moderna: barra branca com o logotipo e os dois acessos
 * secundários (Área médica / Acesso da equipe). O acesso do paciente é o
 * botão principal, destacado no hero.
 */
export function Header() {
  return (
    <header className="relative z-20 rounded-b-[20px] bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,.5)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <Link href="/" aria-label="Portal HC — início" className="flex-none">
          <Image
            src="/brand/portalhc-logo.png"
            alt="Portal HC — Hospital das Clínicas de Mineiros"
            width={323}
            height={120}
            priority
            className="h-10 w-auto sm:h-14"
          />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-7">
          <Link
            href="/medico"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2A3A46] transition-colors hover:text-[#0a7d6e] sm:text-[.95rem]"
          >
            Área médica <span aria-hidden className="text-[#9aa8b2]">↗</span>
          </Link>
          <Link
            href="/equipe"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2A3A46] transition-colors hover:text-[#0a7d6e] sm:text-[.95rem]"
          >
            <span className="hidden sm:inline">Acesso da equipe</span>
            <span className="sm:hidden">Equipe</span>
            <span aria-hidden className="text-[#9aa8b2]">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
