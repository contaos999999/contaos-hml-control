import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  CAMPOS_CADASTRO,
  ErroCadastro,
  executarComando,
  montarComando,
  obterCadastro,
  type CadastroOperacional,
  type ComandoCadastro,
  type ContextoCadastro,
} from "@/lib/cadastros/cadastroOperacionalDados";

const CAMPO =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const MENSAGENS = {
  negado: "Você não tem permissão para alterar este cadastro.",
  conflito:
    "O cadastro foi alterado. Recarregue a versão atual e revise seu rascunho antes de confirmar novamente.",
  invalido: "Confira os campos, a situação selecionada e o motivo informado.",
  incerto:
    "Não foi possível confirmar o resultado. Confira o cadastro ou repita explicitamente o mesmo comando com o mesmo identificador.",
  inconsistente:
    "O servidor não retornou um cadastro compatível com este contexto. Recarregue para conferir.",
};
function valores(c: CadastroOperacional) {
  return Object.fromEntries(
    CAMPOS_CADASTRO[c.entidade].map((f) => [
      f.nome,
      c.registro[f.nome] == null ? "" : String(c.registro[f.nome]),
    ]),
  );
}
export function GerenciarCadastro({
  contexto,
  onAlterado,
}: {
  contexto: ContextoCadastro;
  onAlterado?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="space-y-3">
      {!aberto ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setAberto(true)}
        >
          {contexto.entidade === "organizacoes"
            ? "Gerenciar organização selecionada"
            : "Editar e gerenciar contrato"}
        </Button>
      ) : (
        <Formulario
          key={`${contexto.idUsuario}:${contexto.idOrganizacao}:${contexto.entidade}:${contexto.id}`}
          contexto={contexto}
          {...(onAlterado ? { onAlterado } : {})}
          onFechar={() => setAberto(false)}
        />
      )}
    </div>
  );
}
function Formulario({
  contexto,
  onAlterado,
  onFechar,
}: {
  contexto: ContextoCadastro;
  onAlterado?: () => void;
  onFechar: () => void;
}) {
  const qc = useQueryClient();
  const chave = [
    "cadastro-operacional",
    contexto.idUsuario,
    contexto.idOrganizacao,
    contexto.entidade,
    contexto.id,
  ];
  const q = useQuery({
    queryKey: chave,
    queryFn: () => obterCadastro(contexto),
    retry: false,
    gcTime: 0,
  });
  const [modelo, setModelo] = useState<CadastroOperacional | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [motivo, setMotivo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [confirmacao, setConfirmacao] = useState<"editar" | "situacao" | null>(null);
  const [erro, setErro] = useState<ErroCadastro["tipo"] | null>(null);
  const [sucesso, setSucesso] = useState<"editar" | "situacao" | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [pendente, setPendente] = useState<ComandoCadastro | null>(null);
  const [conflitos, setConflitos] = useState<string[]>([]);
  const [reconciliar, setReconciliar] = useState(false);
  const [versaoConfirmada, setVersaoConfirmada] = useState<number | null>(null);
  const trava = useRef(false);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  useEffect(() => {
    if (!modelo && q.data && !q.isFetching) {
      setModelo(q.data);
      setForm(valores(q.data));
    }
  }, [modelo, q.data, q.isFetching]);

  async function recarregar(preservar: boolean) {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true);
    setConfirmacao(null);
    try {
      const atual = await q.refetch();
      if (!montado.current) return;
      if (!atual.data || atual.error) throw atual.error ?? new ErroCadastro("inconsistente");
      if (modelo && atual.data.registro.versao_registro < modelo.registro.versao_registro) {
        qc.setQueryData(chave, modelo);
        throw new ErroCadastro("inconsistente");
      }
      atualizarFormulario(atual.data, preservar);
      setModelo(atual.data);
      setErro(null);
      setPendente(null);
      setSituacao("");
      setSucesso(null);
      setReconciliar(false);
      setVersaoConfirmada(null);
    } catch (e) {
      if (montado.current) setErro(e instanceof ErroCadastro ? e.tipo : "incerto");
    } finally {
      trava.current = false;
      if (montado.current) setOcupado(false);
    }
  }
  function alteracoes() {
    const patch: Record<string, string | number | null> = {};
    for (const campo of CAMPOS_CADASTRO[contexto.entidade]) {
      const bruto = (form[campo.nome] ?? "").trim();
      const valor = bruto === "" ? null : campo.tipo === "number" ? Number(bruto) : bruto;
      if (modelo?.registro[campo.nome] !== valor) patch[campo.nome] = valor;
    }
    return patch;
  }
  function atualizarFormulario(atual: CadastroOperacional, preservar: boolean) {
    const remotos = valores(atual);
    const locais = preservar ? alteracoes() : {};
    const alterados = Object.keys(locais);
    setConflitos(
      alterados.filter(
        (nome) =>
          modelo?.registro[nome] !== atual.registro[nome] && locais[nome] !== atual.registro[nome],
      ),
    );
    setForm((anterior) => ({
      ...remotos,
      ...Object.fromEntries(alterados.map((nome) => [nome, anterior[nome] ?? ""])),
    }));
  }
  const patch = modelo ? alteracoes() : {};
  const camposValidos = CAMPOS_CADASTRO[contexto.entidade].every(
    (f) =>
      (!f.obrigatorio || !!form[f.nome]?.trim()) &&
      (f.tipo !== "number" || !form[f.nome]?.trim() || Number.isFinite(Number(form[f.nome]))),
  );
  const motivoValido = motivo.trim().length >= 3 && motivo.trim().length <= 2000;
  const pode =
    !!modelo?.pode_editar && q.data?.pode_editar === true && !q.isError && erro !== "negado";
  const transicoes = q.data?.transicoes ?? [];
  const versaoMudou =
    !!modelo && !!q.data && modelo.registro.versao_registro !== q.data.registro.versao_registro;
  const bloqueado =
    ocupado ||
    !!pendente ||
    q.isFetching ||
    !pode ||
    versaoMudou ||
    erro === "conflito" ||
    reconciliar;

  async function enviar(comando?: ComandoCadastro) {
    if (trava.current || !modelo || !pode || (!comando && bloqueado)) return;
    let novo: ComandoCadastro;
    try {
      novo =
        comando ??
        montarComando(
          contexto,
          modelo.registro.versao_registro,
          confirmacao === "situacao" ? "situacao" : "editar",
          confirmacao === "situacao" ? { situacao } : patch,
          motivo,
          crypto.randomUUID(),
        );
    } catch {
      setErro("invalido");
      return;
    }
    trava.current = true;
    setOcupado(true);
    setErro(null);
    setSucesso(null);
    setPendente(novo);
    try {
      const recibo = await executarComando(contexto, novo);
      if (!montado.current) return;
      let atual = recibo;
      let leituraPendente = false;
      if (comando) {
        try {
          const remoto = await obterCadastro(contexto);
          if (!montado.current) return;
          if (remoto.registro.versao_registro < recibo.registro.versao_registro)
            leituraPendente = true;
          else atual = remoto;
        } catch {
          if (!montado.current) return;
          leituraPendente = true;
        }
      }
      const cache = qc.getQueryData<CadastroOperacional>(chave);
      if (cache && cache.registro.versao_registro > atual.registro.versao_registro) atual = cache;
      const mudancaSituacao = novo.nome.startsWith("alterar_situacao_");
      atualizarFormulario(atual, mudancaSituacao);
      setModelo(atual);
      setMotivo("");
      setSituacao("");
      setConfirmacao(null);
      setPendente(null);
      setSucesso(mudancaSituacao ? "situacao" : "editar");
      setReconciliar(leituraPendente);
      setVersaoConfirmada(recibo.registro.versao_registro);
      qc.setQueryData(chave, atual);
      void qc.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] !== "cadastro-operacional" &&
          query.queryKey.includes(contexto.idUsuario) &&
          query.queryKey.includes(contexto.idOrganizacao),
      });
      onAlterado?.();
    } catch (e) {
      if (!montado.current) return;
      const tipo = e instanceof ErroCadastro ? e.tipo : "incerto";
      setErro(tipo);
      setConfirmacao(null);
      if (tipo !== "incerto" && tipo !== "inconsistente") setPendente(null);
    } finally {
      trava.current = false;
      if (montado.current) setOcupado(false);
    }
  }

  if (q.isPending || (!modelo && !q.isError))
    return (
      <div role="status" className="space-y-3">
        <p>Carregando gestão do cadastro…</p>
        <Button type="button" variant="outline" onClick={onFechar}>
          Fechar gestão
        </Button>
      </div>
    );
  if (!modelo || q.isError)
    return (
      <div className="space-y-3">
        <p role="alert">{MENSAGENS[q.error instanceof ErroCadastro ? q.error.tipo : "incerto"]}</p>
        <Button
          type="button"
          variant="outline"
          disabled={q.isFetching}
          onClick={() => void recarregar(false)}
        >
          Recarregar cadastro
        </Button>
        <Button type="button" variant="ghost" onClick={onFechar}>
          Fechar gestão
        </Button>
      </div>
    );
  const prefixo = `cadastro-${contexto.entidade}-${contexto.id}`;
  return (
    <section
      aria-label={
        contexto.entidade === "organizacoes" ? "Gestão da organização" : "Gestão do contrato"
      }
      className="space-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {contexto.entidade === "organizacoes" ? "Gestão da organização" : "Gestão do contrato"}
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          disabled={ocupado}
          onClick={onFechar}
        >
          Fechar gestão
        </Button>
      </div>
      <p className="text-sm">
        Situação atual: <strong>{modelo.registro.situacao}</strong> ·{" "}
        <span>Versão {modelo.registro.versao_registro}</span>
      </p>
      <p className="text-sm text-muted-foreground">{modelo.motivo_retencao}</p>
      {sucesso && (
        <p role="status">
          {sucesso === "situacao"
            ? "Situação confirmada e registrada na auditoria. Alterações em outros campos continuam como rascunho."
            : "Alteração confirmada e registrada na auditoria."}
        </p>
      )}
      {sucesso && versaoConfirmada && modelo.registro.versao_registro > versaoConfirmada && (
        <p role="status" className="text-sm">
          Seu comando foi registrado na versão {versaoConfirmada}. O cadastro já está na versão{" "}
          {modelo.registro.versao_registro}.
        </p>
      )}
      {reconciliar && (
        <div className="space-y-2">
          <p role="alert">
            O comando foi confirmado, mas a leitura atual ficou indisponível. Recarregue o cadastro
            antes de editar novamente.
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={ocupado}
            onClick={() => void recarregar(false)}
          >
            Recarregar cadastro
          </Button>
        </div>
      )}
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {MENSAGENS[erro]}
        </p>
      )}
      {versaoMudou && !erro && (
        <p role="alert">Há uma versão mais recente. Recarregue e revise seu rascunho.</p>
      )}
      {conflitos
        .filter((nome) => form[nome] !== String(modelo.registro[nome] ?? ""))
        .map((nome) => (
          <div
            key={nome}
            role="status"
            className="space-y-2 rounded-lg border border-border p-3 text-sm"
          >
            <p>
              Revise a diferença em{" "}
              {CAMPOS_CADASTRO[contexto.entidade].find((f) => f.nome === nome)?.rotulo}.
            </p>
            <p className="break-words">No servidor: {String(modelo.registro[nome] ?? "(vazio)")}</p>
            <p className="break-words">Seu rascunho: {form[nome] || "(vazio)"}</p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={ocupado || !!confirmacao || !!pendente}
              onClick={() => {
                setForm((v) => ({ ...v, [nome]: String(modelo.registro[nome] ?? "") }));
                setConflitos((v) => v.filter((c) => c !== nome));
              }}
            >
              Usar valor do servidor em{" "}
              {CAMPOS_CADASTRO[contexto.entidade].find((f) => f.nome === nome)?.rotulo}
            </Button>
          </div>
        ))}
      {!pode ? (
        <p role="status">{MENSAGENS.negado}</p>
      ) : (
        <>
          <fieldset disabled={bloqueado || !!confirmacao} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Dados editáveis do cadastro</legend>
            {CAMPOS_CADASTRO[contexto.entidade].map((f) => (
              <div key={f.nome} className="space-y-1">
                <label className="text-sm font-medium" htmlFor={`${prefixo}-${f.nome}`}>
                  {f.rotulo}
                </label>
                {f.nome === "criticidade" ? (
                  <select
                    id={`${prefixo}-${f.nome}`}
                    className={CAMPO}
                    value={form[f.nome] ?? ""}
                    onChange={(e) => {
                      setForm((v) => ({ ...v, [f.nome]: e.target.value }));
                      setSucesso(null);
                    }}
                  >
                    <option value="baixa">baixa</option>
                    <option value="media">media</option>
                    <option value="alta">alta</option>
                    <option value="critica">critica</option>
                  </select>
                ) : (
                  <input
                    id={`${prefixo}-${f.nome}`}
                    className={CAMPO}
                    type={f.tipo}
                    step={f.tipo === "number" ? "any" : undefined}
                    required={f.obrigatorio}
                    value={form[f.nome] ?? ""}
                    onChange={(e) => {
                      setForm((v) => ({ ...v, [f.nome]: e.target.value }));
                      setSucesso(null);
                    }}
                  />
                )}
              </div>
            ))}
          </fieldset>
          <div className="space-y-1">
            <label htmlFor={`${prefixo}-motivo`} className="text-sm font-medium">
              Motivo
            </label>
            <textarea
              id={`${prefixo}-motivo`}
              className={`${CAMPO} min-h-24 py-2`}
              maxLength={2000}
              value={motivo}
              disabled={bloqueado || !!confirmacao}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <Button
            type="button"
            className="min-h-11"
            disabled={
              bloqueado ||
              !!confirmacao ||
              !motivoValido ||
              !camposValidos ||
              !Object.keys(patch).length
            }
            onClick={() => {
              setErro(null);
              setConfirmacao("editar");
            }}
          >
            Revisar edição
          </Button>
          {transicoes.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <label htmlFor={`${prefixo}-situacao`} className="text-sm font-medium">
                Nova situação
              </label>
              <select
                id={`${prefixo}-situacao`}
                className={CAMPO}
                value={situacao}
                disabled={bloqueado || !!confirmacao}
                onChange={(e) => setSituacao(e.target.value)}
              >
                <option value="">Selecione a situação</option>
                {transicoes.map((t) => (
                  <option key={t.situacao} value={t.situacao}>
                    {t.rotulo}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                A mudança de situação não salva alterações dos campos acima. Encerramento e
                cancelamento são definitivos neste fluxo.
              </p>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={
                  bloqueado ||
                  !!confirmacao ||
                  !motivoValido ||
                  !transicoes.some((t) => t.situacao === situacao)
                }
                onClick={() => {
                  setErro(null);
                  setConfirmacao("situacao");
                }}
              >
                Revisar situação
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não há mudança de situação disponível neste estado.
            </p>
          )}
          {confirmacao && (
            <div
              role="group"
              aria-label="Confirmar alteração"
              className="space-y-3 rounded-lg border border-primary/40 p-3"
            >
              <p>
                {confirmacao === "editar"
                  ? "Confirme a edição dos campos alterados."
                  : `Confirme a mudança da situação ${modelo.registro.situacao} para ${situacao}.`}{" "}
                A operação registrará seu motivo e a versão na auditoria.
              </p>
              <p className="break-words text-sm">Motivo: {motivo}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="min-h-11"
                  disabled={ocupado || q.isFetching || versaoMudou}
                  onClick={() => void enviar()}
                >
                  {ocupado
                    ? "Salvando…"
                    : confirmacao === "editar"
                      ? "Confirmar edição"
                      : "Confirmar mudança de situação"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={ocupado}
                  onClick={() => setConfirmacao(null)}
                >
                  Cancelar confirmação
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {pendente && !ocupado && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={() => void enviar(pendente)}>
            Repetir mesmo comando
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => void recarregar(false)}
          >
            Conferir cadastro atual
          </Button>
        </div>
      )}
      {(erro === "conflito" || versaoMudou) && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={ocupado}
          onClick={() => void recarregar(true)}
        >
          Recarregar versão e revisar rascunho
        </Button>
      )}
      {erro === "negado" && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={ocupado}
          onClick={() => void recarregar(true)}
        >
          Recarregar cadastro
        </Button>
      )}
    </section>
  );
}
