"use client";

import { useEffect, useRef, useState } from "react";

export interface SignaturePadHandle {
  isEmpty: boolean;
  dataUrl: string | null;
}

export function SignaturePad({
  onChange,
}: {
  onChange?: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [vazio, setVazio] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1A1616";
  }, []);

  function pos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (vazio) setVazio(false);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const url = canvasRef.current!.toDataURL("image/png");
    onChange?.(vazio ? null : url);
  }

  function limpar() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setVazio(true);
    onChange?.(null);
  }

  return (
    <div>
      <div className="relative rounded-xl border-2 border-dashed border-[var(--hc-line)] bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-40 w-full touch-none rounded-xl"
        />
        {vazio && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--hc-ink-soft)]">
            Assine aqui com o dedo ou o mouse
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={limpar}
        className="mt-2 text-xs text-[var(--hc-ink-soft)] hover:text-[var(--hc-red-600)]"
      >
        Limpar assinatura
      </button>
    </div>
  );
}
