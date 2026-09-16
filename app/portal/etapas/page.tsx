import type { Metadata } from "next";
import { ShellPortal, ItemPortal } from "@/components/portal/ShellPortal";

export const metadata: Metadata = { title: "Cada etapa, mais clara" };

export default function CadaEtapa() {
  return (
    <ShellPortal
      eyebrow="Cada etapa, mais clara"
      titulo="Acompanhe o seu atendimento, do início à conclusão."
      intro="Do cadastro à liberação, o portal deixa cada etapa do seu atendimento mais clara e simples de acompanhar."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ItemPortal titulo="Você sabe onde está">
          Veja o que já foi concluído e o que ainda falta no seu atendimento.
        </ItemPortal>
        <ItemPortal titulo="Progresso simples">
          Uma visão direta dos documentos a ler e assinar, sem termos complicados.
        </ItemPortal>
        <ItemPortal titulo="Transparência">
          Procedimento, médico responsável e valores ficam à vista na sua área.
        </ItemPortal>
        <ItemPortal titulo="Do início à conclusão">
          Ao concluir os documentos, a equipe pode liberar a sua admissão com tudo registrado.
        </ItemPortal>
      </div>
    </ShellPortal>
  );
}
