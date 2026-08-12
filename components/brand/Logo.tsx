import Image from "next/image";
import { HOSPITAL } from "@/lib/brand";

export function Logo({
  size = 60,
  withWordmark = true,
  variant = "dark",
}: {
  size?: number;
  withWordmark?: boolean;
  variant?: "dark" | "light";
}) {
  const nome = Math.round(size * 0.42);
  const sub = Math.round(size * 0.2);
  const light = variant === "light";
  return (
    <div className="flex items-center gap-3.5">
      <Image
        src={HOSPITAL.logo}
        alt={`Logo ${HOSPITAL.nome}`}
        width={size}
        height={Math.round(size * 0.73)}
        priority
        className={`select-none ${light ? "drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]" : ""}`}
      />
      {withWordmark && (
        <div className="leading-none">
          <span
            className={`block font-serif font-semibold ${light ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,.4)]" : "text-[var(--hc-ink)]"}`}
            style={{ fontSize: nome }}
          >
            Portal <span className={light ? "text-[var(--hc-gold-soft)]" : "text-[var(--hc-red-600)]"}>HC</span>
          </span>
          <span
            className={`mt-1 block tracking-wide ${light ? "text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,.5)]" : "text-[var(--hc-ink-soft)]"}`}
            style={{ fontSize: sub }}
          >
            Hospital das Clínicas de Mineiros
          </span>
        </div>
      )}
    </div>
  );
}
