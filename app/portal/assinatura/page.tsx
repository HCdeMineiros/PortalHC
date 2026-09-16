import type { Metadata } from "next";
import { ShellPortal, ItemPortal } from "@/components/portal/ShellPortal";

export const metadata: Metadata = { title: "Assinatura eletrônica" };

export default function AssinaturaEletronica() {
  return (
    <ShellPortal
      eyebrow="Assinatura eletrônica"
      titulo="Leia com calma e assine pelo portal, no seu tempo."
      intro="Você lê os termos de consentimento com tranquilidade e assina eletronicamente, com validade jurídica — tudo pelo portal, sem imprimir nada."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ItemPortal titulo="No seu tempo">
          Leia quantas vezes quiser antes de assinar. Nada é enviado sem a sua confirmação.
        </ItemPortal>
        <ItemPortal titulo="Validade jurídica">
          A assinatura eletrônica registra o seu consentimento de forma segura e reconhecida.
        </ItemPortal>
        <ItemPortal titulo="Sem papel">
          Assine do celular ou do computador, sem precisar imprimir ou comparecer só para isso.
        </ItemPortal>
        <ItemPortal titulo="Comprovação">
          Cada assinatura gera evidências (data e hora), guardadas com segurança.
        </ItemPortal>
      </div>
    </ShellPortal>
  );
}
