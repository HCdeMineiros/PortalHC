"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Campo de senha com ícone de olho para mostrar/ocultar.
 * Aceita as mesmas props de um <input> (value, onChange, placeholder, className, etc.).
 */
export function CampoSenha({
  className = "",
  defaultVisivel = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { defaultVisivel?: boolean }) {
  const [ver, setVer] = useState(defaultVisivel);
  return (
    <div className="relative">
      <input {...props} type={ver ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-ink-soft)] transition-colors hover:text-[var(--hc-ink)]"
      >
        {ver ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
}
