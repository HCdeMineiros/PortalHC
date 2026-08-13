"use client";

import { useState } from "react";
import { CriarUsuario } from "./CriarUsuario";
import { ListaUsuarios } from "./ListaUsuarios";

/** Une o cadastro de usuários com a lista (que atualiza ao criar/excluir). */
export function PainelUsuarios() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <section>
        <CriarUsuario onCriado={() => setRefreshKey((k) => k + 1)} />
      </section>
      <section className="mt-8">
        <ListaUsuarios refreshKey={refreshKey} />
      </section>
    </>
  );
}
