const PASSOS = [
  { n: "1", titulo: "Cadastro pelo médico", texto: "O médico registra o procedimento e gera um código de acesso para você." },
  { n: "2", titulo: "Acesso seguro", texto: "Você entra com CPF, data de nascimento e o código que recebeu." },
  { n: "3", titulo: "Leitura e assinatura", texto: "Lê os termos com calma e assina eletronicamente, com validade jurídica." },
  { n: "4", titulo: "Liberação", texto: "A internação é liberada e tudo fica registrado com segurança." },
];

/** "Como funciona" — 4 passos, versão enxuta (alvo do link "Conheça o portal"). */
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-6 bg-hc-navy-1">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-hc-cyan">
          Como funciona
        </span>
        <h2 className="font-display mt-3 max-w-[24ch] text-[clamp(1.6rem,3.4vw,2.3rem)] font-bold leading-tight text-hc-navy-ink">
          Do cadastro à assinatura, em 4 passos simples.
        </h2>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((p) => (
            <li key={p.n} className="rounded-[18px] border border-hc-navy-line bg-hc-surface p-6">
              <span className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-hc-cyan text-lg font-bold text-[var(--hc-cyan-ink)]">
                {p.n}
              </span>
              <h3 className="font-display mt-4 text-[1.06rem] font-bold text-hc-navy-ink">{p.titulo}</h3>
              <p className="mt-1.5 text-[.9rem] leading-relaxed text-hc-navy-soft">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
