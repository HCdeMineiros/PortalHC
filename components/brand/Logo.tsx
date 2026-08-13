import Image from "next/image";

/** Proporção da arte composta "Portal HC" (1592 × 458). */
const RATIO = 1592 / 458;

export function Logo({
  height = 50,
  variant = "dark",
}: {
  /** altura em px; a largura é calculada pela proporção da arte */
  height?: number;
  /** "dark" = texto escuro (fundo claro) · "light" = texto creme (fundo escuro) */
  variant?: "dark" | "light";
}) {
  const src =
    variant === "light" ? "/brand/logo-portal-hc-light.png" : "/brand/logo-portal-hc.png";
  return (
    <Image
      src={src}
      alt="Portal HC — Hospital das Clínicas de Mineiros"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      className={`select-none ${variant === "light" ? "drop-shadow-[0_2px_10px_rgba(0,0,0,.35)]" : ""}`}
      style={{ height, width: "auto" }}
    />
  );
}
