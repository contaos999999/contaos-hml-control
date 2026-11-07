import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ErroBn } from "@/lib/contratos/baseNormativaDados";
import { listarListas } from "@/lib/contratos/regrasDados";
import {
  ErroLista,
  obterLista,
  montarComandoLista,
  executarComandoLista,
  ROTULOS_LISTA,
  type AcaoLista,
  type ComandoLista,
  type ContextoLista,
  type ItemOperacional,
  type ListaOperacional,
} from "@/lib/contratos/listaOperacionalDados";
const CAMPO =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const ERROS = {
  negado: "Você não tem permissão para esta operação.",
  conflito:
    "A lista foi alterada. Atualize os dados e revise seu rascunho antes de confirmar novamente.",
  invalido: "Confira os campos, as referências, a vigência e o motivo informado.",
  incerto:
    "O resultado não foi confirmado. Confira a lista antes de repetir explicitamente o mesmo comando.",
  inconsistente: "O servidor retornou dados incompatíveis com o contexto. Atualize para conferir.",
};
export function GerenciarListas({ contexto }: { contexto: ContextoLista }) {
  const [aberto, setAberto] = useState(false);
  return aberto ? (
    <Painel
      key={`${contexto.idUsuario}:${contexto.idOrganizacao}:${contexto.idContrato}`}
      contexto={contexto}
      onFechar={() => setAberto(false)}
    />
  ) : (
    <Button type="button" variant="outline" className="min-h-11" onClick={() => setAberto(true)}>
      Gerenciar listas
    </Button>
  );
}
function Painel({ contexto: c, onFechar }: { contexto: ContextoLista; onFechar: () => void }) {
  const qc = useQueryClient();
  const vivo = useRef(true);
  const [expirou, setExpirou] = useState(false);
  useEffect(() => {
    vivo.current = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.id !== c.idUsuario) {
        vivo.current = false;
        setExpirou(true);
      }
    });
    return () => {
      vivo.current = false;
      data.subscription.unsubscribe();
    };
  }, [c.idUsuario]);
  const [pagina, setPagina] = useState(0);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [versao, setVersao] = useState<string | null>(null);
  const [pv, setPv] = useState(0);
  const [pi, setPi] = useState(0);
  const [form, setForm] = useState<{ acao: AcaoLista; item?: ItemOperacional } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [pendente, setPendente] = useState<ComandoLista | null>(null);
  const [erro, setErro] = useState<ErroLista["tipo"] | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const base = ["listas-operacionais", c.idUsuario, c.idOrganizacao, c.idContrato];
  const listas = useQuery({
    queryKey: [...base, "cabecalhos", pagina],
    queryFn: ({ signal }) => listarListas(c.idContrato, pagina, signal),
    retry: false,
    gcTime: 0,
    enabled: !expirou,
  });
  const id = selecionada ?? listas.data?.itens[0]?.id ?? null;
  const q = useQuery({
    queryKey: [...base, id, versao, pv, pi],
    queryFn: () => obterLista(c, id, versao, pv, pi),
    enabled: !expirou && listas.isSuccess,
    retry: false,
    gcTime: 0,
  });
  const d = q.data;
  const leituraNegada =
    (q.error instanceof ErroLista && q.error.tipo === "negado") ||
    (listas.error instanceof ErroBn && listas.error.tipo === "negado");
  const leituraTransitoria =
    q.isError && q.error instanceof ErroLista && q.error.tipo === "incerto";
  const bloquearEdicao =
    ocupado || !!pendente || q.isError || q.isFetching || listas.isError || listas.isFetching;
  async function enviar(cmd: ComandoLista) {
    if (ocupado || !vivo.current || leituraNegada) return;
    // Uma leitura falha nunca autoriza nova intenção. O replay explícito da
    // mesma intenção incerta preserva sua chave e é revalidado pelo servidor.
    if ((q.isError || q.isFetching || listas.isError || listas.isFetching) && cmd !== pendente)
      return;
    setOcupado(true);
    setErro(null);
    setSucesso(false);
    try {
      const r = await executarComandoLista(c, cmd);
      if (!vivo.current) return;
      setPendente(null);
      setForm(null);
      setSelecionada(r.lista.id);
      setVersao(r.id_versao);
      setPv(0);
      setPi(0);
      setSucesso(true);
      await qc.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes(c.idUsuario) &&
          query.queryKey.includes(c.idOrganizacao) &&
          query.queryKey.includes(c.idContrato),
      });
    } catch (e) {
      if (vivo.current) {
        const t = e instanceof ErroLista ? e.tipo : "incerto";
        setErro(t);
        setPendente(t === "incerto" ? cmd : null);
      }
    } finally {
      if (vivo.current) setOcupado(false);
    }
  }
  function escolher(acao: AcaoLista, i?: ItemOperacional) {
    setForm({ acao, ...(i ? { item: i } : {}) });
    setErro(null);
    setSucesso(false);
  }
  if (expirou)
    return <p role="alert">Sua sessão mudou. Reabra esta página para continuar com segurança.</p>;
  return (
    <section
      aria-label="Gestão de listas"
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Gestão de listas</h2>
        <Button type="button" variant="outline" disabled={ocupado || !!pendente} onClick={onFechar}>
          Fechar gestão
        </Button>
      </div>
      {(listas.isPending || q.isPending) && <p role="status">Carregando listas e permissões…</p>}
      {(listas.isError || q.isError) && (
        <div role="alert">
          <p>
            {leituraNegada
              ? ERROS.negado
              : q.error instanceof ErroLista
                ? ERROS[q.error.tipo]
                : "Não foi possível carregar as listas."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void listas.refetch();
              void q.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {d && !leituraNegada && leituraTransitoria && (
        <p role="status">
          Não foi possível atualizar a leitura. Seu rascunho foi preservado; novas operações estão
          bloqueadas até a recuperação.
        </p>
      )}
      {d && !leituraNegada && (!q.isError || leituraTransitoria) && (
        <>
          <label className="block space-y-1">
            <span>Lista selecionada</span>
            <select
              className={CAMPO}
              disabled={bloquearEdicao}
              value={id ?? ""}
              onChange={(e) => {
                setSelecionada(e.target.value || null);
                setVersao(null);
                setPv(0);
                setPi(0);
                setForm(null);
              }}
            >
              {!listas.data?.itens.length && <option value="">Nenhuma lista cadastrada</option>}
              {listas.data?.itens.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
          <Paginacao
            nome="listas"
            pagina={pagina}
            total={listas.data?.total ?? 0}
            disabled={bloquearEdicao}
            onMudar={(p) => {
              setPagina(p);
              setSelecionada(null);
              setVersao(null);
              setPv(0);
              setPi(0);
              setForm(null);
            }}
          />
          <p className="text-sm text-muted-foreground">{d.motivo_retencao}</p>
          {d.lista && (
            <p className="text-sm">
              {d.lista.nome} · {d.lista.situacao} · revisão {d.lista.versao_registro}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {(
              [
                "criar_lista",
                "editar_lista",
                "criar_versao",
                "editar_vigencia_rascunho",
                "publicar_versao",
                "encerrar_vigencia",
                "alterar_situacao",
                "descartar_rascunho",
              ] as const
            )
              .filter((a) => d.acoes[a])
              .map((a) => (
                <Button
                  type="button"
                  variant="outline"
                  key={a}
                  disabled={bloquearEdicao}
                  onClick={() => escolher(a)}
                >
                  {ROTULOS_LISTA[a]}
                </Button>
              ))}
            {d.acoes.criar_item && (
              <Button
                type="button"
                disabled={bloquearEdicao}
                onClick={() => escolher("salvar_item")}
              >
                Adicionar item
              </Button>
            )}
          </div>
          {d.versao && (
            <label className="block space-y-1">
              <span>Versão selecionada</span>
              <select
                className={CAMPO}
                disabled={bloquearEdicao}
                value={d.versao.id}
                onChange={(e) => {
                  setVersao(e.target.value);
                  setPi(0);
                  setForm(null);
                }}
              >
                {!d.versoes.some((v) => v.id === d.versao?.id) && (
                  <option value={d.versao.id}>Versão {d.versao.numero_versao}</option>
                )}
                {d.versoes.map((v) => (
                  <option key={v.id} value={v.id}>
                    Versão {v.numero_versao} ·{" "}
                    {v.situacao === "substituida" && !v["aprovado_em"] ? "Descartada" : v.situacao}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Paginacao
            nome="versões"
            pagina={pv}
            total={d.total_versoes}
            disabled={bloquearEdicao}
            onMudar={setPv}
          />
          {d.versao && (
            <p className="text-sm">
              Vigência: {dataBr(d.versao.vigencia_inicio)} a {dataBr(d.versao.vigencia_fim)}
              {d.vigencia_fim_minima && ` · Encerramento mínimo: ${dataBr(d.vigencia_fim_minima)}`}
            </p>
          )}
          {!d.itens.length ? (
            <p>Nenhum item nesta versão.</p>
          ) : (
            <ul className="space-y-2">
              {d.itens.map((i) => (
                <li key={i.id} className="space-y-2 rounded-md border border-border p-3">
                  <p className="break-words font-medium">
                    {i.codigo} · {i.descricao}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {i.obrigatorio ? "Obrigatório" : "Opcional"} ·{" "}
                    {i.aplicavel ? "Aplicável" : "Não aplicável"} ·{" "}
                    {i.impeditivo ? "Impeditivo" : "Não impeditivo"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.acoes.editar_item && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={bloquearEdicao}
                        onClick={() => escolher("salvar_item", i)}
                      >
                        Editar item {i.codigo}
                      </Button>
                    )}
                    {d.acoes.remover_item && i.pode_remover && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={bloquearEdicao}
                        onClick={() => escolher("remover_item", i)}
                      >
                        Remover item {i.codigo}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Paginacao
            nome="itens"
            pagina={pi}
            total={d.total_itens}
            disabled={bloquearEdicao}
            onMudar={setPi}
          />
          {form && (
            <Formulario
              key={`${form.acao}:${form.item?.id ?? "novo"}:${id}:${d.versao?.id}`}
              modelo={d}
              contexto={c}
              acao={form.acao}
              {...(form.item ? { item: form.item } : {})}
              disabled={bloquearEdicao}
              onEnviar={enviar}
              onCancelar={() => setForm(null)}
            />
          )}
        </>
      )}
      {erro && <p role="alert">{ERROS[erro]}</p>}
      {erro === "conflito" && (
        <Button type="button" variant="outline" disabled={ocupado} onClick={() => void q.refetch()}>
          Atualizar dados e revisar rascunho
        </Button>
      )}
      {pendente && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={ocupado}
            onClick={async () => {
              if (ocupado || !vivo.current) return;
              setOcupado(true);
              const resultados = await Promise.all([listas.refetch(), q.refetch()]);
              if (!vivo.current) return;
              if (resultados.every((r) => r.isSuccess)) {
                setPendente(null);
                setForm(null);
                setErro(null);
              } else setErro("incerto");
              setOcupado(false);
            }}
          >
            Conferir resultado antes de nova operação
          </Button>
          <Button
            type="button"
            disabled={ocupado || leituraNegada}
            onClick={() => void enviar(pendente)}
          >
            Repetir exatamente o mesmo comando
          </Button>
        </div>
      )}
      {ocupado && <p role="status">Enviando operação…</p>}
      {sucesso && (
        <p role="status">Operação confirmada pelo servidor. Confira a leitura atualizada.</p>
      )}
    </section>
  );
}
function dataBr(v: string | null) {
  return v ? v.slice(0, 10).split("-").reverse().join("/") : "Sem término definido";
}
function Paginacao({
  nome,
  pagina,
  total,
  disabled,
  onMudar,
}: {
  nome: string;
  pagina: number;
  total: number;
  disabled: boolean;
  onMudar: (p: number) => void;
}) {
  return total > 25 ? (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pagina === 0}
        onClick={() => onMudar(pagina - 1)}
      >
        Página anterior de {nome}
      </Button>
      <span>
        Página {pagina + 1} de {Math.ceil(total / 25)}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || (pagina + 1) * 25 >= total}
        onClick={() => onMudar(pagina + 1)}
      >
        Próxima página de {nome}
      </Button>
    </div>
  ) : null;
}
function Formulario({
  modelo: d,
  contexto: c,
  acao: a,
  item: i,
  disabled,
  onEnviar,
  onCancelar,
}: {
  modelo: ListaOperacional;
  contexto: ContextoLista;
  acao: AcaoLista;
  item?: ItemOperacional;
  disabled: boolean;
  onEnviar: (cmd: ComandoLista) => Promise<void>;
  onCancelar: () => void;
}) {
  const [val, setVal] = useState<Record<string, string | boolean>>({
    nome: d.lista?.nome ?? "",
    descricao: d.lista?.descricao ?? "",
    vigencia_inicio: d.versao?.vigencia_inicio ?? "",
    vigencia_fim: d.versao?.vigencia_fim ?? "",
    id_versao_origem: d.versao?.id ?? "",
    codigo: i?.codigo ?? "",
    descricao_item: i?.descricao ?? "",
    categoria: i?.categoria ?? "",
    obrigatorio: i?.obrigatorio ?? true,
    aplicavel: i?.aplicavel ?? true,
    impeditivo: i?.impeditivo ?? false,
    criticidade: i?.criticidade ?? "media",
    id_fonte_versao: i?.id_fonte_versao ?? "",
    regra_validacao: JSON.stringify(i?.regra_validacao ?? {}, null, 2),
    ordem: String(i?.ordem ?? 0),
    situacao: d.lista?.situacao === "ativa" ? "inativa" : "ativa",
  });
  const [revisaoBase, setRevisaoBase] = useState(d.lista?.versao_registro ?? null);
  const [motivo, setMotivo] = useState("");
  const [cmd, setCmd] = useState<ComandoLista | null>(null);
  const [erro, setErro] = useState(false);
  function campo(nome: string, rotulo: string, tipo = "text") {
    return (
      <label className="block space-y-1" key={nome}>
        <span>{rotulo}</span>
        <input
          className={CAMPO}
          type={tipo}
          disabled={disabled || !!cmd}
          value={String(val[nome] ?? "")}
          onChange={(e) => setVal((v) => ({ ...v, [nome]: e.target.value }))}
        />
      </label>
    );
  }
  function revisar(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setErro(false);
    try {
      let p: Record<string, unknown> = {};
      const nullable = (k: string) => val[k] || null;
      if (a === "criar_lista" || a === "editar_lista")
        p = { nome: String(val["nome"]).trim(), descricao: nullable("descricao") };
      if (["criar_lista", "criar_versao", "editar_vigencia_rascunho"].includes(a))
        p = {
          ...p,
          vigencia_inicio: nullable("vigencia_inicio"),
          vigencia_fim: nullable("vigencia_fim"),
        };
      if (a === "criar_versao") p["id_versao_origem"] = nullable("id_versao_origem");
      if (
        [
          "editar_vigencia_rascunho",
          "salvar_item",
          "remover_item",
          "publicar_versao",
          "encerrar_vigencia",
          "descartar_rascunho",
        ].includes(a)
      )
        p["id_versao"] = d.versao?.id;
      if (a === "salvar_item")
        p = {
          ...p,
          id_item: i?.id ?? null,
          codigo: val["codigo"],
          descricao: val["descricao_item"],
          categoria: nullable("categoria"),
          obrigatorio: val["obrigatorio"],
          aplicavel: val["aplicavel"],
          impeditivo: val["impeditivo"],
          criticidade: val["criticidade"],
          id_fonte_versao: nullable("id_fonte_versao"),
          regra_validacao: JSON.parse(String(val["regra_validacao"])),
          ordem: Number(val["ordem"]),
        };
      if (a === "remover_item") p["id_item"] = i?.id;
      if (a === "encerrar_vigencia") p["vigencia_fim"] = nullable("vigencia_fim");
      if (a === "alterar_situacao") p["situacao"] = val["situacao"];
      setCmd(
        montarComandoLista(
          c,
          a === "criar_lista" ? null : (d.lista?.id ?? null),
          a === "criar_lista" ? null : revisaoBase,
          a,
          p,
          motivo,
          crypto.randomUUID(),
        ),
      );
    } catch {
      setErro(true);
    }
  }
  return (
    <form onSubmit={revisar} className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="font-semibold">{ROTULOS_LISTA[a]}</h3>
      <fieldset disabled={disabled} className="space-y-3">
        {(a === "criar_lista" || a === "editar_lista") && (
          <>
            {campo("nome", "Nome")}
            {campo("descricao", "Descrição")}
          </>
        )}
        {["criar_lista", "criar_versao", "editar_vigencia_rascunho"].includes(a) && (
          <>
            {campo("vigencia_inicio", "Início da vigência", "date")}
            {campo("vigencia_fim", "Fim da vigência", "date")}
          </>
        )}
        {a === "criar_versao" && (
          <label className="block space-y-1">
            <span>Copiar itens da versão</span>
            <select
              className={CAMPO}
              disabled={!!cmd}
              value={String(val["id_versao_origem"])}
              onChange={(e) => setVal((v) => ({ ...v, id_versao_origem: e.target.value }))}
            >
              <option value="">Criar versão vazia</option>
              {d.versao && !d.versoes.some((v) => v.id === d.versao?.id) && (
                <option value={d.versao.id}>Versão {d.versao.numero_versao}</option>
              )}
              {d.versoes.map((v) => (
                <option key={v.id} value={v.id}>
                  Versão {v.numero_versao}
                </option>
              ))}
            </select>
          </label>
        )}
        {a === "salvar_item" && (
          <>
            {campo("codigo", "Código")}
            {campo("descricao_item", "Descrição do item")}
            {campo("categoria", "Categoria")}
            {(
              [
                ["obrigatorio", "Obrigatório"],
                ["aplicavel", "Aplicável"],
                ["impeditivo", "Impeditivo"],
              ] as const
            ).map(([k, label]) => (
              <label className="flex min-h-11 items-center gap-2" key={k}>
                <input
                  type="checkbox"
                  disabled={!!cmd}
                  checked={val[k] === true}
                  onChange={(e) => setVal((v) => ({ ...v, [k]: e.target.checked }))}
                />
                {label}
              </label>
            ))}
            <label className="block space-y-1">
              <span>Criticidade</span>
              <select
                className={CAMPO}
                disabled={!!cmd}
                value={String(val["criticidade"])}
                onChange={(e) => setVal((v) => ({ ...v, criticidade: e.target.value }))}
              >
                {["baixa", "media", "alta", "critica"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {campo("id_fonte_versao", "Identificador da versão da fonte formal")}
            {campo("ordem", "Ordem", "number")}
            <label className="block space-y-1">
              <span>Regra de validação e condição (JSON)</span>
              <textarea
                className={CAMPO}
                rows={5}
                disabled={!!cmd}
                value={String(val["regra_validacao"])}
                onChange={(e) => setVal((v) => ({ ...v, regra_validacao: e.target.value }))}
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Use apenas critérios e condições suportados pelo contrato. A fonte e a regra serão
              validadas pelo servidor antes da publicação.
            </p>
          </>
        )}
        {a === "encerrar_vigencia" && campo("vigencia_fim", "Fim da vigência", "date")}
        {a === "alterar_situacao" && (
          <label className="block space-y-1">
            <span>Situação</span>
            <select
              className={CAMPO}
              disabled={!!cmd}
              value={String(val["situacao"])}
              onChange={(e) => setVal((v) => ({ ...v, situacao: e.target.value }))}
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </label>
        )}
        <label className="block space-y-1">
          <span>Motivo</span>
          <textarea
            className={CAMPO}
            required
            minLength={3}
            maxLength={2000}
            disabled={!!cmd}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        {erro && (
          <p role="alert">
            Revise os campos e o motivo. A regra JSON precisa ser um objeto válido.
          </p>
        )}
        {cmd ? (
          <div className="space-y-2">
            <p>
              Confirmar {ROTULOS_LISTA[a].toLocaleLowerCase("pt-BR")}? A operação ficará registrada
              na auditoria.
            </p>
            <p className="break-words text-sm">Motivo: {cmd.p_motivo}</p>
            <Button type="button" onClick={() => void onEnviar(cmd)}>
              Confirmar operação
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCmd(null);
                setRevisaoBase(d.lista?.versao_registro ?? null);
              }}
            >
              Revisar campos
            </Button>
          </div>
        ) : (
          <Button type="submit">Revisar operação</Button>
        )}
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar operação
        </Button>
      </fieldset>
    </form>
  );
}
