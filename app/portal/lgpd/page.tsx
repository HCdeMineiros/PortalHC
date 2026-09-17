import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { ShellPortal, ItemPortal } from "@/components/portal/ShellPortal";
import { HOSPITAL } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacidade e LGPD" };

export default function PrivacidadeLGPD() {
  return (
    <ShellPortal
      eyebrow="Privacidade e LGPD"
      titulo="Como o hospital cuida dos seus dados."
      intro="O Hospital das Clínicas de Mineiros trata dados pessoais — inclusive dados de saúde — com responsabilidade e de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ItemPortal titulo="Dados de saúde são sensíveis">
          A LGPD dá proteção reforçada aos dados de saúde. Por isso, tratamos essas informações com cuidado e sigilo redobrados.
        </ItemPortal>
        <ItemPortal titulo="Para que usamos">
          Para prestar o seu atendimento, cumprir obrigações legais e de saúde e registrar os seus consentimentos — sempre com a finalidade do cuidado.
        </ItemPortal>
        <ItemPortal titulo="Bases legais">
          O tratamento se apoia na tutela da saúde, no cumprimento de obrigações legais e regulatórias e, quando aplicável, no seu consentimento.
        </ItemPortal>
        <ItemPortal titulo="Seus direitos">
          Você pode confirmar a existência do tratamento, acessar e corrigir seus dados e ser informado sobre com quem eles são compartilhados.
        </ItemPortal>
        <ItemPortal titulo="Segurança e sigilo">
          Acesso individual por código, registros de acesso (trilha de auditoria) e o dever de confidencialidade de toda a equipe.
        </ItemPortal>
        <ItemPortal titulo="Guarda pelo tempo necessário">
          Mantemos os dados apenas pelo período exigido pela legislação e pela sua segurança assistencial.
        </ItemPortal>
      </div>

      {/* Encarregado (DPO) */}
      <div className="mt-8 hcx-card-d p-6 sm:p-8">
        <span className="hcx-badge-d">Encarregado de Dados · DPO</span>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl border border-hc-navy-line sm:h-28 sm:w-28">
            <Image
              src="/brand/dpo-denis.png"
              alt="Dr. Denis Carvalho — Encarregado de Dados (DPO)"
              fill
              sizes="112px"
              className="object-cover object-[center_28%]"
            />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-hc-navy-ink">Dr. Denis Carvalho</h2>
            <p className="text-sm text-hc-navy-soft">
              Advogado · Encarregado pelo Tratamento de Dados Pessoais (DPO) do Hospital das Clínicas de Mineiros.
            </p>
            <p className="mt-3 text-sm text-hc-navy-soft">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade e proteção de dados, fale com o
              Encarregado pelos canais oficiais do hospital:
            </p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-hc-navy-ink">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 flex-none text-hc-cyan" aria-hidden /> {HOSPITAL.telefones.join(" · ")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 flex-none text-hc-cyan" aria-hidden /> {HOSPITAL.dominio}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ShellPortal>
  );
}
