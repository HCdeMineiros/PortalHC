import Image from "next/image";

/** Proporção da arte "portalhc" (2058 × 764). */
const RATIO = 2058 / 764;

export function Logo({
  height = 50,
  variant = "dark",
}: {
  /** altura em px; a largura é calculada pela proporção da arte */
  height?: number;
  /** "dark" = logo sobre fundo claro · "light" = logo sobre fundo escuro (em plaqueta branca) */
  variant?: "dark" | "light";
}) {
  // No fundo escuro o logo (texto escuro) vai numa plaqueta branca para legibilidade.
  const h = variant === "light" ? Math.min(height, 44) : height;
  const img = (
    <Image
      src="/brand/portalhc-logo.png"
      alt="Portal HC — Hospital das Clínicas de Mineiros"
      width={Math.round(h * RATIO)}
      height={h}
      priority
      className="select-none"
      style={{ height: h, width: "auto" }}
    />
  );

  if (variant === "light") {
    return (
      <span className="logo-plate inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-[0_4px_16px_-6px_rgba(0,0,0,.4)]" style={{ backgroundColor: "#ffffff" }}>
        {img}
      </span>
    );
  }
  return img;
}
