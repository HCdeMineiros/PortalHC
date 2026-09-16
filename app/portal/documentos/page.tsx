import type { Metadata } from "next";
import { ShellPortal, ItemPortal } from "@/components/portal/ShellPortal";

export const metadata: Metadata = { title: "Seus documentos" };

export default function SeusDocumentos() {
  return (
    <ShellPortal
      eyebrow="Seus documentos"
      titulo="Todos os documentos do seu atendimento, em um só lugar."
      intro="No Portal HC você acessa os documentos do seu procedimento com organização e praticidade — sem papelada e sem precisar se deslocar."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ItemPortal titulo="Reunidos e organizados">
          Termos de consentimento e documentos informativos do seu atendimento ficam reunidos na sua área, prontos para leitura.
        </ItemPortal>
        <ItemPortal titulo="Acesso quando quiser">
          Consulte no seu tempo, do computador ou do celular, sempre que precisar.
        </ItemPortal>
        <ItemPortal titulo="Só o que é seu">
          Com o acesso por código individual, você vê apenas os documentos do seu próprio procedimento.
        </ItemPortal>
        <ItemPortal titulo="Registro do que foi feito">
          Cada leitura e aceite fica registrado, com data e hora, para a sua segurança.
        </ItemPortal>
      </div>
    </ShellPortal>
  );
}
