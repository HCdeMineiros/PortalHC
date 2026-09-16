import type { Metadata } from "next";
import { ShellPortal } from "@/components/portal/ShellPortal";

export const metadata: Metadata = { title: "Conheça o portal" };

const PASSOS = [
  { n: "1", titulo: "Cadastro pelo médico", texto: "O médico registra o procedimento e gera um código de acesso para você." },
  { n: "2", titulo: "Acesso seguro", texto: "Você entra com CPF, data de nascimento e o código que recebeu." },
  { n: "3", titulo: "Leitura e assinatura", texto: "Lê os termos com calma e assina eletronicamente, com validade jurídica." },
  { n: "4", titulo: "Liberação", texto: "A internação é liberada e tudo fica registrado com segurança." },
];

export default function ConhecaOPortal() {
  return (
    <ShellPortal
      eyebrow="Conheça o portal"
      titulo="Do cadastro à assinatura, em 4 passos simples."
      intro="O Portal HC reúne, em um só lugar, os documentos, as assinaturas e as etapas do seu atendimento — com segurança e conformidade à LGPD. Veja como funciona."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map((p) => (
          <li key={p.n} className="hcx-card-d p-6">
            <span className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-hc-cyan text-lg font-bold text-[var(--hc-cyan-ink)]">
              {p.n}
            </span>
            <h3 className="font-display mt-4 text-[1.06rem] font-bold text-hc-navy-ink">{p.titulo}</h3>
            <p className="mt-1.5 text-[.9rem] leading-relaxed text-hc-navy-soft">{p.texto}</p>
          </li>
        ))}
      </ol>
    </ShellPortal>
  );
}
