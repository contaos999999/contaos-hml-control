import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  consultarEvidenciasElegiveis,
  consultarPlanoAcao,
  consultarPortaoRodada,
  consultarPreferenciasTarefa,
  ErroPlanoAcao,
  EVENTOS_TAREFA,
  PAGINA_DOCS,
  PAGINA_PLANO,
  PRIORIDADES_TAREFA,
  registrarAcaoTarefa,
  salvarPreferenciaTarefa,
  SITUACOES_TAREFA,
  TIPOS_TAREFA,
  VALIDACOES_TAREFA,
  type AcaoTarefa,
  type DadosTarefa,
  type EscopoPlanoAcao,
  type PaginaEvidencias,
  type PlanoAcao,
  type PortaoRodada,
  type PreferenciaTarefa,
  type TarefaDiligencia,
} from "@/lib/diligencias/planoAcaoDiligenciaDados";

const SELECT = "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm";
const CARTAO = "space-y-3 rounded-md border border-border bg-card p-4";
const MENSAGENS = {
  sem_permissao: "Seu perfil não tem permissão para esta operação no plano de ação.",
  invalido: "Revise os campos, as dependências e a versão escolhida antes de confirmar.",
  conflito: "A tarefa mudou. A lista foi atualizada para que você confira a situação atual.",
  erro: "A resposta não foi confirmada. Confira a lista ou tente novamente.",
};
const RESPOSTAS = {
  salvar: "Tarefa registrada.",
  submeter: "Evidência submetida para revalidação.",
  revisar: "Revisão registrada.",
};

type Formulario =
  | { tipo: "salvar"; tarefa: TarefaDiligencia | null }
  | { tipo: "submeter" | "revisar"; tarefa: TarefaDiligencia };
type Leitura = { chave: string; dados: PlanoAcao } | { chave: string; erro: string };
type Props = {
  escopo: EscopoPlanoAcao;
  apontamento: string;
  usuario: string;
  aoRegistrar: () => void;
};

function mensagem(erro: unknown) {
  return MENSAGENS[erro instanceof ErroPlanoAcao ? erro.tipo : "erro"];
}

export function PlanoAcaoDiligencia({ escopo, apontamento, usuario, aoRegistrar }: Props) {
  const { id, id_competencia, id_contrato, id_organizacao } = escopo;
  const contexto = useMemo(
    () => ({ id, id_competencia, id_contrato, id_organizacao }),
    [id, id_competencia, id_contrato, id_organizacao],
  );
  const titulo = useRef<HTMLHeadingElement>(null);
  const consulta = useRef<AbortController | null>(null);
  const escrita = useRef<AbortController | null>(null);
  const tentativa = useRef<{ assinatura: string; chave: string } | null>(null);
  const [aberto, setAberto] = useState(false);
  const [offset, setOffset] = useState(0);
  const [revisao, setRevisao] = useState(0);
  const [leitura, setLeitura] = useState<Leitura>();
  const [portao, setPortao] = useState<PortaoRodada | "erro">();
  const [formulario, setFormulario] = useState<Formulario>();
  const [avisos, setAvisos] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState("");
  const [recibo, setRecibo] = useState<{ titulo: string; correlacao: string }>();
  const chave = offset + ":" + revisao;
  const atual = leitura?.chave === chave ? leitura : undefined;

  useEffect(() => {
    if (!aberto) return;
    const controller = new AbortController();
    consulta.current = controller;
    const { signal } = controller;
    void consultarPlanoAcao(contexto, apontamento, offset, signal).then(
      (dados) => {
        if (!signal.aborted) setLeitura({ chave, dados });
      },
      (e: unknown) => {
        if (!signal.aborted) setLeitura({ chave, erro: mensagem(e) });
      },
    );
    void consultarPortaoRodada(contexto.id, signal).then(
      (dados) => {
        if (!signal.aborted) setPortao(dados);
      },
      () => {
        if (!signal.aborted) setPortao("erro");
      },
    );
    return () => {
      controller.abort();
      if (consulta.current === controller) consulta.current = null;
    };
  }, [aberto, apontamento, chave, contexto, offset]);

  useEffect(() => () => escrita.current?.abort(), []);

  function atualizar() {
    consulta.current?.abort();
    setPortao(undefined);
    setRevisao((n) => n + 1);
  }

  function mudarAbertura(proximo: boolean) {
    if (!proximo) {
      consulta.current?.abort();
      escrita.current?.abort();
      escrita.current = null;
      setFormulario(undefined);
      setAvisos(false);
      setGravando(false);
      setErro("");
      setRecibo(undefined);
      setOffset(0);
      atualizar();
    }
    setAberto(proximo);
  }

  function abrir(form: Formulario) {
    setFormulario(form);
    setErro("");
    setRecibo(undefined);
  }

  async function enviar(acao: AcaoTarefa) {
    if (escrita.current) return;
    const controller = new AbortController();
    escrita.current = controller;
    const { signal } = controller;
    const assinatura = JSON.stringify(acao);
    if (tentativa.current?.assinatura !== assinatura)
      tentativa.current = { assinatura, chave: crypto.randomUUID() };
    setGravando(true);
    setErro("");
    try {
      const result = await registrarAcaoTarefa(
        contexto,
        apontamento,
        acao,
        tentativa.current.chave,
        signal,
      );
      if (signal.aborted) return;
      tentativa.current = null;
      setFormulario(undefined);
      setRecibo({ titulo: RESPOSTAS[acao.tipo], correlacao: result.correlation_id });
      atualizar();
      aoRegistrar();
      titulo.current?.focus();
    } catch (e) {
      if (signal.aborted) return;
      setErro(mensagem(e));
      if (e instanceof ErroPlanoAcao && e.tipo !== "erro") {
        tentativa.current = null;
        if (e.tipo === "conflito" || e.tipo === "sem_permissao") {
          setFormulario(undefined);
          atualizar();
          aoRegistrar();
          titulo.current?.focus();
        }
      }
    } finally {
      if (escrita.current === controller) {
        escrita.current = null;
        setGravando(false);
      }
    }
  }

  return (
    <Sheet open={aberto} onOpenChange={mudarAbertura}>
      <SheetTrigger asChild>
        <Button className="min-h-11" variant="outline">
          Abrir plano de ação
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl [&>button.absolute]:hidden">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle ref={titulo} tabIndex={-1}>
            Plano de ação
          </SheetTitle>
          <SheetDescription>Tarefas e evidências deste apontamento.</SheetDescription>
          <SheetClose asChild>
            <Button className="min-h-11 self-start" variant="ghost">
              Fechar plano de ação
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="space-y-4 text-sm">
          {recibo && (
            <div role="status" className={CARTAO}>
              <p>{recibo.titulo}</p>
              <p>Correlação para consulta na trilha de auditoria</p>
              <code className="break-all">{recibo.correlacao}</code>
            </div>
          )}
          {erro && <p role="alert">{erro}</p>}
          {!atual ? (
            <p role="status">Carregando tarefas do apontamento…</p>
          ) : "erro" in atual ? (
            <>
              <p role="alert">{atual.erro}</p>
              <Button className="min-h-11" variant="outline" onClick={atualizar}>
                Tentar novamente
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {atual.dados.criar && !formulario && (
                  <Button
                    className="min-h-11"
                    onClick={() => abrir({ tipo: "salvar", tarefa: null })}
                  >
                    Nova tarefa
                  </Button>
                )}
                {!formulario && (
                  <Button className="min-h-11" variant="outline" onClick={atualizar}>
                    Atualizar plano
                  </Button>
                )}
                <Button
                  className="min-h-11"
                  variant="ghost"
                  onClick={() => setAvisos((v) => !v)}
                  aria-expanded={avisos}
                >
                  Preferências de avisos
                </Button>
              </div>
              {portao && (
                <p role="status">
                  {portao === "erro"
                    ? "Situação da rodada indisponível."
                    : "Apontamentos tratados na rodada " +
                      portao.tratados +
                      " de " +
                      portao.total +
                      "."}
                </p>
              )}
              {avisos && (
                <PreferenciasAvisos
                  organizacao={contexto.id_organizacao}
                  usuario={usuario}
                  papel={atual.dados.perfil_preferencia}
                />
              )}
              {formulario ? (
                <div className={CARTAO}>
                  {formulario.tipo === "salvar" ? (
                    <EditarTarefa
                      tarefa={formulario.tarefa}
                      plano={atual.dados}
                      gravando={gravando}
                      aoEnviar={enviar}
                    />
                  ) : formulario.tipo === "submeter" ? (
                    <SelecionarEvidencia
                      escopo={contexto}
                      tarefa={formulario.tarefa}
                      gravando={gravando}
                      aoEnviar={enviar}
                    />
                  ) : (
                    <RevisarTarefa
                      tarefa={formulario.tarefa}
                      gravando={gravando}
                      aoEnviar={enviar}
                    />
                  )}
                  <Button
                    className="min-h-11"
                    variant="ghost"
                    disabled={gravando}
                    onClick={() => {
                      setFormulario(undefined);
                      setErro("");
                      titulo.current?.focus();
                    }}
                  >
                    Voltar às tarefas
                  </Button>
                </div>
              ) : (
                <>
                  <ListaTarefas plano={atual.dados} aoAbrir={abrir} />
                  <Paginacao
                    offset={offset}
                    total={atual.dados.total}
                    tamanho={PAGINA_PLANO}
                    navegar={setOffset}
                    nome="tarefas"
                  />
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Paginacao({
  offset,
  total,
  tamanho,
  navegar,
  nome,
}: {
  offset: number;
  total: number;
  tamanho: number;
  navegar: (offset: number) => void;
  nome: string;
}) {
  if (offset === 0 && total <= tamanho) return null;
  return (
    <nav aria-label={"Paginação de " + nome} className="flex flex-wrap items-center gap-2">
      <Button
        className="min-h-11"
        variant="outline"
        disabled={offset === 0}
        onClick={() => navegar(Math.max(0, offset - tamanho))}
      >
        Anterior
      </Button>
      <span>Página {Math.floor(offset / tamanho) + 1}</span>
      <Button
        className="min-h-11"
        variant="outline"
        disabled={offset + tamanho >= total}
        onClick={() => navegar(offset + tamanho)}
      >
        Próxima
      </Button>
    </nav>
  );
}

function Legenda({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

function ListaTarefas({
  plano,
  aoAbrir,
}: {
  plano: PlanoAcao;
  aoAbrir: (form: Formulario) => void;
}) {
  if (!plano.tarefas.length) return <p role="status">Nenhuma tarefa nesta página.</p>;
  const nomes = new Map(plano.responsaveis.map((u) => [u.id, u.nome]));
  const dependencias = new Map(plano.dependencias.map((t) => [t.id, t.descricao]));
  return (
    <ul className="space-y-3" aria-label="Tarefas do apontamento">
      {plano.tarefas.map((t) => (
        <li key={t.id} className={CARTAO}>
          <h3 className="break-words text-base font-semibold">{t.descricao}</h3>
          <dl className="grid grid-cols-2 gap-2">
            <Legenda rotulo="Situação">{SITUACOES_TAREFA[t.status]}</Legenda>
            <Legenda rotulo="Validação">{VALIDACOES_TAREFA[t.validacao_solucao]}</Legenda>
            <Legenda rotulo="Responsável">
              {t.responsavel
                ? (nomes.get(t.responsavel) ?? "Vínculo indisponível")
                : "Não atribuído"}
            </Legenda>
            <Legenda rotulo="Prazo">
              {t.prazo?.split("-").reverse().join("/") ?? "Não informado"}
            </Legenda>
            <Legenda rotulo="Prioridade">{PRIORIDADES_TAREFA[t.prioridade]}</Legenda>
            <Legenda rotulo="Tipo">
              {t.tipo_acao
                ? (TIPOS_TAREFA[t.tipo_acao as keyof typeof TIPOS_TAREFA] ?? t.tipo_acao)
                : "Não informado"}
            </Legenda>
          </dl>
          {t.depende_de.length > 0 && (
            <p className="break-words">
              Dependências{" "}
              {t.depende_de.map((id) => dependencias.get(id) ?? "tarefa indisponível").join(", ")}
            </p>
          )}
          {(t.estado_execucao === "enfileirado" || t.estado_execucao === "processando") && (
            <p role="status">Revalidação em processamento.</p>
          )}
          {(t.estado_execucao === "falhou" || t.estado_execucao === "cancelado") && (
            <p role="status">Revalidação indisponível. Confira a opção de reenvio.</p>
          )}
          {t.prova && (
            <p>
              {t.prova.evidencia_suficiente
                ? "Evidência suficiente para revisão humana."
                : "Evidência insuficiente para aprovação."}{" "}
              {formatarDataHoraBr(t.prova.registrado_em)}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {t.editar && (
              <Button
                className="min-h-11"
                variant="outline"
                onClick={() => aoAbrir({ tipo: "salvar", tarefa: t })}
              >
                Editar tarefa
              </Button>
            )}
            {t.submeter && (
              <Button
                className="min-h-11"
                variant="outline"
                onClick={() => aoAbrir({ tipo: "submeter", tarefa: t })}
              >
                Submeter evidência
              </Button>
            )}
            {t.revisar && (
              <Button
                className="min-h-11"
                variant="outline"
                onClick={() => aoAbrir({ tipo: "revisar", tarefa: t })}
              >
                Revisar solução
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function EditarTarefa({
  tarefa,
  plano,
  gravando,
  aoEnviar,
}: {
  tarefa: TarefaDiligencia | null;
  plano: PlanoAcao;
  gravando: boolean;
  aoEnviar: (acao: AcaoTarefa) => void;
}) {
  const tipo = tarefa?.tipo_acao ?? "corrigir_documento";
  const [personalizado, setPersonalizado] = useState(!Object.hasOwn(TIPOS_TAREFA, tipo));
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const texto = (chave: string) => String(f.get(chave) ?? "").trim();
    const idPlano = texto("plano");
    const dados: DadosTarefa = {
      descricao: texto("descricao"),
      tipo_acao: texto(personalizado ? "tipoLivre" : "tipo"),
      prazo: texto("prazo"),
      responsavel: texto("responsavel"),
      prioridade: texto("prioridade") as DadosTarefa["prioridade"],
      depende_de: f.getAll("dependencia").map(String),
      ...(idPlano ? { id_plano: idPlano } : {}),
    };
    aoEnviar({ tipo: "salvar", tarefa, dados });
  }
  return (
    <form
      className="space-y-3"
      aria-label={tarefa ? "Editar tarefa" : "Nova tarefa"}
      onSubmit={enviar}
    >
      <h3 className="text-base font-semibold">{tarefa ? "Editar tarefa" : "Nova tarefa"}</h3>
      <Label htmlFor="vp-descricao">Descrição</Label>
      <Textarea
        id="vp-descricao"
        name="descricao"
        defaultValue={tarefa?.descricao}
        required
        maxLength={1500}
      />
      <Label htmlFor="vp-responsavel">Responsável</Label>
      <select
        id="vp-responsavel"
        name="responsavel"
        className={SELECT}
        required
        defaultValue={tarefa?.responsavel ?? ""}
      >
        <option value="">Selecionar responsável</option>
        {plano.responsaveis.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome ?? "Pessoa vinculada"}
          </option>
        ))}
      </select>
      <Label htmlFor="vp-prazo">Prazo</Label>
      <Input
        id="vp-prazo"
        name="prazo"
        type="date"
        required
        defaultValue={tarefa?.prazo ?? ""}
        className="min-h-11"
      />
      <Label htmlFor="vp-prioridade">Prioridade</Label>
      <select
        id="vp-prioridade"
        name="prioridade"
        className={SELECT}
        defaultValue={tarefa?.prioridade ?? "media"}
      >
        {Object.entries(PRIORIDADES_TAREFA).map(([chave, rotulo]) => (
          <option key={chave} value={chave}>
            {rotulo}
          </option>
        ))}
      </select>
      <Label htmlFor="vp-tipo">Tipo de ação</Label>
      <select
        id="vp-tipo"
        name="tipo"
        className={SELECT}
        defaultValue={personalizado ? "outro" : tipo}
        onChange={(e) => setPersonalizado(e.target.value === "outro")}
      >
        {Object.entries(TIPOS_TAREFA).map(([chave, rotulo]) => (
          <option key={chave} value={chave}>
            {rotulo}
          </option>
        ))}
        <option value="outro">Outro tipo</option>
      </select>
      {personalizado && (
        <div className="space-y-2">
          <Label htmlFor="vp-tipo-livre">Nome do tipo</Label>
          <Input
            id="vp-tipo-livre"
            name="tipoLivre"
            required
            maxLength={120}
            defaultValue={Object.hasOwn(TIPOS_TAREFA, tipo) ? "" : tipo}
          />
        </div>
      )}
      {plano.planos.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="vp-plano">Plano</Label>
          <select
            id="vp-plano"
            name="plano"
            className={SELECT}
            defaultValue={tarefa?.id_plano ?? ""}
          >
            <option value="">
              {tarefa?.id_plano ? "Manter o plano atual" : "Plano da rodada"}
            </option>
            {plano.planos
              .filter((p) => p.status === "aberto" || p.status === "em_execucao")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
          </select>
        </div>
      )}
      {plano.dependencias.some((d) => d.id !== tarefa?.id) && (
        <fieldset className="space-y-1">
          <legend className="font-medium">Dependências</legend>
          {plano.dependencias
            .filter((d) => d.id !== tarefa?.id)
            .map((d) => (
              <label key={d.id} className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  name="dependencia"
                  value={d.id}
                  defaultChecked={tarefa?.depende_de.includes(d.id)}
                />
                <span className="break-words">{d.descricao}</span>
              </label>
            ))}
        </fieldset>
      )}
      <Button className="min-h-11" type="submit" disabled={gravando}>
        {gravando ? "Registrando…" : "Salvar tarefa"}
      </Button>
    </form>
  );
}

function SelecionarEvidencia({
  escopo,
  tarefa,
  gravando,
  aoEnviar,
}: {
  escopo: EscopoPlanoAcao;
  tarefa: TarefaDiligencia;
  gravando: boolean;
  aoEnviar: (acao: AcaoTarefa) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [revisao, setRevisao] = useState(0);
  const [escolhida, setEscolhida] = useState("");
  const chave = offset + ":" + revisao;
  const [resultado, setResultado] = useState<{ chave: string; dados: PaginaEvidencias | string }>();
  const dados = resultado?.chave === chave ? resultado.dados : undefined;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void consultarEvidenciasElegiveis(escopo, offset, signal).then(
      (dados) => {
        if (!signal.aborted) setResultado({ chave, dados });
      },
      (e: unknown) => {
        if (!signal.aborted) setResultado({ chave, dados: mensagem(e) });
      },
    );
    return () => controller.abort();
  }, [chave, escopo, offset]);

  function selecionarPagina(novo: number) {
    setEscolhida("");
    setOffset(novo);
  }

  return (
    <form
      aria-label="Submeter evidência"
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (typeof dados === "object" && dados.opcoes.some((v) => v.id === escolhida))
          aoEnviar({ tipo: "submeter", tarefa, evidencia: escolhida });
      }}
    >
      <h3 className="text-base font-semibold">Submeter evidência</h3>
      <p className="break-words">{tarefa.descricao}</p>
      <Button asChild className="min-h-11 h-auto whitespace-normal text-left" variant="link">
        <Link to="/competencias/$id/documentos" params={{ id: escopo.id_competencia }}>
          Ver documentos da competência
        </Link>
      </Button>
      {dados === undefined ? (
        <p role="status">Carregando versões da competência…</p>
      ) : typeof dados === "string" ? (
        <>
          <p role="alert">{dados}</p>
          <Button
            type="button"
            className="min-h-11"
            variant="outline"
            onClick={() => setRevisao((n) => n + 1)}
          >
            Recarregar versões
          </Button>
        </>
      ) : (
        <>
          {dados.opcoes.length ? (
            <>
              <Label htmlFor="vp-evidencia">Versão da evidência</Label>
              <select
                id="vp-evidencia"
                className={SELECT}
                value={escolhida}
                onChange={(e) => setEscolhida(e.target.value)}
                required
              >
                <option value="">Selecionar versão vigente</option>
                {dados.opcoes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.titulo} · versão {v.numero}
                  </option>
                ))}
              </select>
              {dados.opcoes.find((v) => v.id === escolhida)?.hash && (
                <p>
                  SHA-256{" "}
                  <code className="break-all">
                    {dados.opcoes.find((v) => v.id === escolhida)?.hash}
                  </code>
                </p>
              )}
            </>
          ) : (
            <p role="status">Nenhuma versão elegível nesta página.</p>
          )}
          <Paginacao
            offset={offset}
            total={dados.total}
            tamanho={PAGINA_DOCS}
            navegar={selecionarPagina}
            nome="versões"
          />
          <Button className="min-h-11" type="submit" disabled={gravando || !escolhida}>
            Enviar para revalidação
          </Button>
        </>
      )}
    </form>
  );
}

function RevisarTarefa({
  tarefa,
  gravando,
  aoEnviar,
}: {
  tarefa: TarefaDiligencia;
  gravando: boolean;
  aoEnviar: (acao: AcaoTarefa) => void;
}) {
  const [decisao, setDecisao] = useState<"devolver" | "aprovar">("devolver");
  return (
    <form
      aria-label="Revisar solução"
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fundamento = String(new FormData(e.currentTarget).get("fundamento") ?? "").trim();
        if (fundamento && (decisao === "devolver" || tarefa.aprovar))
          aoEnviar({ tipo: "revisar", tarefa, aprovar: decisao === "aprovar", fundamento });
      }}
    >
      <h3 className="text-base font-semibold">Revisar solução</h3>
      <p className="break-words">{tarefa.descricao}</p>
      {!tarefa.aprovar && <p role="status">A evidência atual permite devolução para ajuste.</p>}
      <Label htmlFor="vp-decisao">Decisão</Label>
      <select
        id="vp-decisao"
        className={SELECT}
        value={decisao}
        onChange={(e) => setDecisao(e.target.value === "aprovar" ? "aprovar" : "devolver")}
      >
        <option value="devolver">Devolver para ajuste</option>
        {tarefa.aprovar && <option value="aprovar">Validar solução</option>}
      </select>
      <Label htmlFor="vp-fundamento">Fundamento da revisão</Label>
      <Textarea id="vp-fundamento" name="fundamento" required maxLength={2500} />
      <Button className="min-h-11" type="submit" disabled={gravando}>
        Registrar revisão
      </Button>
    </form>
  );
}

function PreferenciasAvisos({
  organizacao,
  usuario,
  papel,
}: {
  organizacao: string;
  usuario: string;
  papel: string | null;
}) {
  type Evento = keyof typeof EVENTOS_TAREFA;
  const escrita = useRef<AbortController | null>(null);
  const [preferencias, setPreferencias] = useState<PreferenciaTarefa[]>();
  const [erro, setErro] = useState("");
  const [gravando, setGravando] = useState(false);
  const [evento, setEvento] = useState<Evento>("TarefaDiligenciaAtribuida");
  const [canal, setCanal] = useState<PreferenciaTarefa["canal"]>("in_app");
  const [porPapel, setPorPapel] = useState(false);
  const [revisao, setRevisao] = useState(0);
  const [salva, setSalva] = useState(false);

  useEffect(() => {
    const c = new AbortController();
    void consultarPreferenciasTarefa(organizacao, usuario, papel, c.signal).then(
      (items) => {
        if (!c.signal.aborted) setPreferencias(items);
      },
      (e: unknown) => {
        if (!c.signal.aborted) setErro(mensagem(e));
      },
    );
    return () => {
      c.abort();
      escrita.current?.abort();
    };
  }, [organizacao, papel, revisao, usuario]);

  const eventoPreferido = porPapel && papel ? evento + ":" + papel : evento;
  const configuradas = preferencias?.filter((p) => p.evento === eventoPreferido) ?? [];
  const efetivas = configuradas.length
    ? configuradas
    : (preferencias?.filter((p) => p.evento === evento) ?? []);
  const hab =
    efetivas.find((p) => p.canal === canal)?.habilitado ??
    (efetivas.length === 0 && canal === "in_app");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!preferencias || escrita.current) return;
    const habilitado = new FormData(e.currentTarget).get("habilitado") === "on";
    const p: PreferenciaTarefa = { evento: eventoPreferido, canal, habilitado };
    const c = new AbortController();
    escrita.current = c;
    setGravando(true);
    setErro("");
    setSalva(false);
    try {
      await salvarPreferenciaTarefa(organizacao, usuario, p, c.signal);
      if (!c.signal.aborted) {
        setPreferencias((atual) => [
          ...(atual ?? []).filter((x) => x.evento !== p.evento || x.canal !== p.canal),
          p,
        ]);
        setSalva(true);
      }
    } catch (e) {
      if (!c.signal.aborted) setErro(mensagem(e));
    } finally {
      if (escrita.current === c) {
        escrita.current = null;
        setGravando(false);
      }
    }
  }

  return (
    <section className={CARTAO} aria-label="Preferências de avisos">
      {erro && <p role="alert">{erro}</p>}
      {salva && <p role="status">Preferência registrada.</p>}
      {preferencias ? (
        <form className="space-y-2" onSubmit={enviar}>
          <Label htmlFor="vp-evento-aviso">Evento</Label>
          <select
            id="vp-evento-aviso"
            className={SELECT}
            value={evento}
            onChange={(e) => setEvento(e.target.value as Evento)}
            disabled={gravando}
          >
            {Object.entries(EVENTOS_TAREFA).map(([id, descricao]) => (
              <option key={id} value={id}>
                {descricao}
              </option>
            ))}
          </select>
          <Label htmlFor="vp-canal">Canal</Label>
          <select
            id="vp-canal"
            className={SELECT}
            value={canal}
            onChange={(e) => setCanal(e.target.value === "email" ? "email" : "in_app")}
            disabled={gravando}
          >
            <option value="in_app">No ContaOS</option>
            <option value="email">E-mail</option>
          </select>
          {papel && (
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                checked={porPapel}
                onChange={(e) => setPorPapel(e.target.checked)}
                disabled={gravando}
              />
              Usar esta preferência no meu papel atual
            </label>
          )}
          <label className="flex min-h-11 items-center gap-2">
            <input
              key={eventoPreferido + ":" + canal + ":" + hab}
              name="habilitado"
              type="checkbox"
              defaultChecked={hab}
              disabled={gravando}
            />
            Receber aviso
          </label>
          <Button className="min-h-11" type="submit" disabled={gravando}>
            Salvar preferência
          </Button>
        </form>
      ) : erro ? (
        <Button
          className="min-h-11"
          variant="outline"
          onClick={() => {
            setErro("");
            setRevisao((n) => n + 1);
          }}
        >
          Tentar novamente
        </Button>
      ) : (
        <p role="status">Carregando preferências…</p>
      )}
    </section>
  );
}
