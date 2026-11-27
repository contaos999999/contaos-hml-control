import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { type EvidenciaDiligencia } from "@/lib/diligencias/apontamentoEvidenciasDados";
import {
  consultarContestacoes,
  consultarVinculosContestacao,
  ErroContestacao,
  registrarContestacao,
  type AcaoContestacao,
  type Contestacao,
  type EvidenciaContestacao,
  type PainelContestacao,
} from "@/lib/diligencias/contestacaoDiligenciaDados";
import { type CicloDiligencia } from "@/lib/diligencias/diligenciasDados";
import {
  consultarPortaoRodada,
  type PortaoRodada,
} from "@/lib/diligencias/planoAcaoDiligenciaDados";

const MENSAGENS = {
  sem_permissao: "Seu perfil não tem permissão para acessar a contestação.",
  invalido: "Confira a versão, a página, o trecho e os dados informados.",
  conflito: "A versão ou a situação da rodada mudou. Confira os dados atualizados.",
  erro: "Não foi possível confirmar a operação. Tente novamente.",
};
const ROTULOS = {
  rascunho: "Rascunho",
  pendente: "Aguardando revisão humana",
  aprovada: "Contestação aprovada",
  rejeitada: "Devolvida para ajuste",
  substituida: "Versão substituída",
};
const MINUTAS = {
  enfileirado: "Minuta na fila.",
  processando: "Minuta em processamento.",
  concluido: "Processamento da minuta concluído.",
  falhou: "Falha ao processar a minuta.",
  cancelado: "Processamento da minuta cancelado.",
};
const RECIBOS = {
  minuta: "Solicitação de minuta registrada.",
  submeter: "Versão submetida para revisão.",
  revisar: "Revisão da contestação registrada.",
};
type Escopo = { ciclo: CicloDiligencia; apontamento: string; offset?: number | undefined };
type Paginas = { historico: number; fontes: number };
type Leitura = { chave: string; resposta: PainelContestacao } | { chave: string; erro: string };

export function ContestacaoDiligencia({
  ciclo,
  apontamento,
  offset,
  aoRegistrar,
}: Escopo & { aoRegistrar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [paginas, setPaginas] = useState<Paginas>({ historico: 0, fontes: 0 });
  const [revisao, setRevisao] = useState(0);
  const [paginandoFontes, setPaginandoFontes] = useState(false);
  const [leitura, setLeitura] = useState<Leitura>();
  const [portao, setPortao] = useState<PortaoRodada | "erro">();
  const [vinculos, setVinculos] = useState<Map<string, EvidenciaDiligencia>>();
  const [formulario, setFormulario] = useState<
    | { tipo: "submeter"; versao: number; base?: Contestacao }
    | { tipo: "revisar"; base: Contestacao }
  >();
  const [erro, setErro] = useState("");
  const [gravando, setGravando] = useState(false);
  const [recibo, setRecibo] = useState<{ tipo: AcaoContestacao["tipo"]; referencia: string }>();
  const consulta = useRef<AbortController | null>(null);
  const gravacao = useRef<AbortController | null>(null);
  const intencao = useRef<{ assinatura: string; chave: string } | undefined>(undefined);
  const titulo = useRef<HTMLHeadingElement>(null);
  const chave = `${ciclo.id}:${apontamento}:${paginas.historico}:${paginas.fontes}:${revisao}`;
  const atual = leitura?.chave === chave || paginandoFontes ? leitura : undefined;
  const dados = atual && "resposta" in atual ? atual.resposta : undefined;

  useEffect(() => {
    if (!aberto) return;
    const controller = new AbortController();
    consulta.current = controller;
    const { signal } = controller;
    void consultarContestacoes(
      ciclo.id,
      apontamento,
      paginas.historico,
      paginas.fontes,
      signal,
    ).then(
      async (resposta) => {
        if (signal.aborted) return;
        setLeitura({ chave, resposta });
        setPaginandoFontes(false);
        try {
          const fontes = await consultarVinculosContestacao(resposta, ciclo, signal);
          if (!signal.aborted) setVinculos(fontes);
        } catch {
          if (!signal.aborted) setVinculos(new Map());
        }
      },
      (e: unknown) => {
        if (!signal.aborted) {
          setLeitura({ chave, erro: mensagem(e) });
          setPaginandoFontes(false);
        }
      },
    );
    void consultarPortaoRodada(ciclo.id, signal).then(
      (p) => {
        if (!signal.aborted) setPortao(p);
      },
      () => {
        if (!signal.aborted) setPortao("erro");
      },
    );
    return () => {
      controller.abort();
      if (consulta.current === controller) consulta.current = null;
    };
  }, [aberto, apontamento, chave, ciclo, paginas]);

  useEffect(() => () => gravacao.current?.abort(), []);

  function reler(novasPaginas = paginas, preservarFormulario = false) {
    setPaginandoFontes(preservarFormulario);
    consulta.current?.abort();
    setPortao(undefined);
    setVinculos(undefined);
    setPaginas(novasPaginas);
    setRevisao((n) => n + 1);
  }

  function mudarAbertura(proximo: boolean) {
    if (!proximo) {
      gravacao.current?.abort();
      gravacao.current = null;
      setGravando(false);
      setFormulario(undefined);
      setErro("");
      setRecibo(undefined);
      reler({ historico: 0, fontes: 0 });
    }
    setAberto(proximo);
  }

  function abrir(form: NonNullable<typeof formulario>) {
    setFormulario(form);
    setErro("");
    setRecibo(undefined);
  }

  async function enviar(acao: AcaoContestacao) {
    if (gravacao.current) return;
    const controller = new AbortController();
    const { signal } = controller;
    gravacao.current = controller;
    const assinatura = JSON.stringify(acao);
    if (intencao.current?.assinatura !== assinatura)
      intencao.current = { assinatura, chave: crypto.randomUUID() };
    setGravando(true);
    setErro("");
    try {
      const resultado = await registrarContestacao(
        apontamento,
        acao,
        intencao.current.chave,
        signal,
      );
      if (signal.aborted) return;
      intencao.current = undefined;
      setFormulario(undefined);
      setRecibo(resultado);
      reler({ historico: 0, fontes: 0 });
      aoRegistrar();
      titulo.current?.focus();
    } catch (e) {
      if (signal.aborted) return;
      setErro(mensagem(e));
      if (e instanceof ErroContestacao && e.tipo !== "erro") {
        intencao.current = undefined;
        if (e.tipo !== "invalido") {
          setFormulario(undefined);
          reler({ historico: 0, fontes: 0 });
          aoRegistrar();
        }
      }
    } finally {
      if (gravacao.current === controller) {
        gravacao.current = null;
        setGravando(false);
      }
    }
  }

  const pendente =
    dados?.minuta?.estado === "enfileirado" || dados?.minuta?.estado === "processando";
  const escopo = { ciclo, apontamento, offset };
  return (
    <Sheet open={aberto} onOpenChange={mudarAbertura}>
      <SheetTrigger asChild>
        <Button variant="outline" className="ml-2 min-h-11">
          Abrir contestação
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl [&>button.absolute]:hidden">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle ref={titulo} tabIndex={-1}>
            Contestação
          </SheetTitle>
          <SheetDescription>
            Minuta, versões, evidências e revisão deste apontamento.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => reler()}
            disabled={gravando || !!formulario}
          >
            Atualizar contestação
          </Button>
          {recibo && (
            <div role="status" className="space-y-1 text-sm">
              <p>{RECIBOS[recibo.tipo]}</p>
              <p>
                {recibo.tipo === "minuta" ? "Execução" : "Correlação de auditoria"}{" "}
                <code className="break-all">{recibo.referencia}</code>
              </p>
              {recibo.tipo !== "minuta" && (
                <Link
                  to="/administracao/auditoria"
                  className="inline-flex min-h-11 items-center underline"
                >
                  Abrir auditoria
                </Link>
              )}
            </div>
          )}
          {erro && <p role="alert">{erro}</p>}
          {!atual && <p role="status">Carregando contestação…</p>}
          {atual && "erro" in atual && <p role="alert">{atual.erro}</p>}
          {dados && (
            <>
              {portao === "erro" ? (
                <p role="status">Portão da rodada indisponível.</p>
              ) : (
                portao && (
                  <p role="status">
                    Apontamentos tratados na rodada {portao.tratados} de {portao.total}.
                  </p>
                )
              )}
              {dados.minuta && <p role="status">{MINUTAS[dados.minuta.estado]}</p>}
              <div className="flex flex-wrap gap-2">
                {dados.submeter && !formulario && (
                  <Button
                    className="min-h-11"
                    disabled={gravando}
                    onClick={() => abrir({ tipo: "submeter", versao: dados.versao_atual })}
                  >
                    Nova versão
                  </Button>
                )}
                {dados.solicitar_minuta && !formulario && (
                  <Button
                    className="min-h-11"
                    variant="outline"
                    disabled={gravando || pendente}
                    onClick={() => void enviar({ tipo: "minuta", versao: dados.versao_atual })}
                  >
                    Solicitar minuta
                  </Button>
                )}
              </div>
              {formulario?.tipo === "submeter" && dados.submeter && (
                <FormularioVersao
                  base={formulario.base}
                  versaoEsperada={formulario.versao}
                  dados={dados}
                  escopo={escopo}
                  vinculos={vinculos}
                  gravando={gravando || paginandoFontes}
                  cancelar={() => setFormulario(undefined)}
                  mudarFontes={(fontes) => reler({ ...paginas, fontes }, true)}
                  enviar={enviar}
                />
              )}
              {formulario?.tipo === "revisar" &&
                dados.contestacoes.some((c) => c.id === formulario.base.id && c.revisar) && (
                  <FormularioRevisao
                    base={formulario.base}
                    gravando={gravando}
                    cancelar={() => setFormulario(undefined)}
                    enviar={enviar}
                  />
                )}
              <section aria-labelledby="contestacao-historico" className="space-y-3">
                <h3 id="contestacao-historico" className="font-semibold">
                  Histórico de versões
                </h3>
                {dados.total === 0 && <p>Nenhuma versão registrada para este apontamento.</p>}
                {dados.contestacoes.map((c) => (
                  <article
                    key={c.id}
                    className="space-y-2 break-words rounded-md border border-border p-3"
                  >
                    <h4 className="font-medium">Versão {c.versao}</h4>
                    <p>
                      {ROTULOS[c.status_aprovacao]} · {formatarDataHoraBr(c.criado_em)}
                    </p>
                    {c.recomendada && <p>Contestação recomendada para avaliação humana.</p>}
                    {c.justificativa_recomendacao && <p>{c.justificativa_recomendacao}</p>}
                    {c.texto && <p className="whitespace-pre-wrap">{c.texto}</p>}
                    {c.fundamento && <p className="whitespace-pre-wrap">{c.fundamento}</p>}
                    {c.aprovado_em && (
                      <p>
                        Decisão em {formatarDataHoraBr(c.aprovado_em)}{" "}
                        {c.aprovado_por && <code className="break-all">{c.aprovado_por}</code>}
                      </p>
                    )}
                    {c.resultado_final && (
                      <p>
                        Desfecho registrado: {c.resultado_final}{" "}
                        {c.resultado_registrado_em && formatarDataHoraBr(c.resultado_registrado_em)}
                      </p>
                    )}
                    {c.mapa.length ? (
                      <ul className="space-y-2" aria-label="Mapa de evidências">
                        {c.mapa.map((e) => (
                          <li key={e.id}>
                            <p>{e.descricao}</p>
                            <p>
                              {e.titulo} · versão {e.versao_documento} · página {e.pagina}
                            </p>
                            <blockquote className="whitespace-pre-wrap">{e.trecho}</blockquote>
                            <FonteLink
                              versao={vinculos?.get(e.id_versao_documento)}
                              escopo={escopo}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sem evidências disponíveis para esta versão.</p>
                    )}
                    {!formulario && c.revisar && (
                      <Button
                        className="min-h-11"
                        disabled={gravando}
                        onClick={() => abrir({ tipo: "revisar", base: c })}
                      >
                        Revisar versão {c.versao}
                      </Button>
                    )}
                    {!formulario && dados.submeter && c.versao === dados.versao_atual && (
                      <Button
                        variant="outline"
                        className="min-h-11"
                        disabled={gravando}
                        onClick={() =>
                          abrir({ tipo: "submeter", versao: dados.versao_atual, base: c })
                        }
                      >
                        Usar versão {c.versao} como base
                      </Button>
                    )}
                  </article>
                ))}
                <Paginacao
                  nome="Histórico"
                  offset={dados.offset}
                  limite={dados.limite}
                  total={dados.total}
                  disabled={gravando || !!formulario}
                  mudar={(historico) => reler({ ...paginas, historico })}
                />
              </section>
            </>
          )}
          <Button variant="outline" className="min-h-11" onClick={() => mudarAbertura(false)}>
            Fechar contestação
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function mensagem(e: unknown) {
  return MENSAGENS[e instanceof ErroContestacao ? e.tipo : "erro"];
}

function FonteLink({
  versao,
  escopo,
}: {
  versao?: EvidenciaDiligencia | undefined;
  escopo: Escopo;
}) {
  if (!versao) return null;
  const { ciclo, apontamento, offset } = escopo;
  return versao.tipo === "contrato" ? (
    <Link
      className="inline-flex min-h-11 items-center underline"
      to="/contratos/$id/documentos/$idDocumento"
      params={{ id: ciclo.id_contrato, idDocumento: versao.documentoId }}
      search={{
        versao: versao.versaoId,
        ciclo: ciclo.id,
        apontamento,
        ...(offset === undefined ? {} : { offset }),
      }}
    >
      Abrir versão {versao.numero} em {versao.titulo}
    </Link>
  ) : (
    <Link
      className="inline-flex min-h-11 items-center underline"
      to="/competencias/$id/documentos"
      params={{ id: ciclo.id_competencia }}
    >
      Ver documentos da competência
    </Link>
  );
}

function Paginacao({
  nome,
  offset,
  limite,
  total,
  disabled,
  mudar,
}: {
  nome: string;
  offset: number;
  limite: number;
  total: number;
  disabled?: boolean;
  mudar: (offset: number) => void;
}) {
  if (offset === 0 && total <= limite) return null;
  return (
    <nav className="flex flex-wrap gap-2" aria-label={nome}>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={disabled || offset === 0}
        onClick={() => mudar(Math.max(0, offset - limite))}
      >
        {nome} anterior
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={disabled || offset + limite >= total}
        onClick={() => mudar(offset + limite)}
      >
        {nome} seguinte
      </Button>
    </nav>
  );
}

function FormularioRevisao({
  base,
  gravando,
  cancelar,
  enviar,
}: {
  base: Contestacao;
  gravando: boolean;
  cancelar: () => void;
  enviar: (acao: AcaoContestacao) => Promise<void>;
}) {
  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const fundamento = String(form.get("fundamento") ?? "").trim();
    const decisao = form.get("decisao");
    if (!fundamento || (decisao !== "aprovar" && decisao !== "devolver")) return;
    void enviar({
      tipo: "revisar",
      versao: base.versao,
      id: base.id,
      aprovar: decisao === "aprovar",
      fundamento,
    });
  }
  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={submeter}>
      <h3 className="font-semibold">Revisão da versão {base.versao}</h3>
      <Label htmlFor="contestacao-decisao">Decisão</Label>
      <select
        id="contestacao-decisao"
        name="decisao"
        required
        defaultValue=""
        className="block min-h-11 w-full rounded-md border border-input bg-background px-2"
      >
        <option value="" disabled>
          Selecione a decisão
        </option>
        <option value="aprovar">Aprovar</option>
        <option value="devolver">Devolver para ajuste</option>
      </select>
      <Label htmlFor="contestacao-fundamento-revisao">Fundamento da revisão</Label>
      <Textarea id="contestacao-fundamento-revisao" name="fundamento" required maxLength={5000} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-11" disabled={gravando}>
          Registrar decisão
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={gravando}
          onClick={cancelar}
        >
          Cancelar revisão
        </Button>
      </div>
    </form>
  );
}

function FormularioVersao({
  base,
  versaoEsperada,
  dados,
  escopo,
  vinculos,
  gravando,
  cancelar,
  mudarFontes,
  enviar,
}: {
  base?: Contestacao | undefined;
  versaoEsperada: number;
  dados: PainelContestacao;
  escopo: Escopo;
  vinculos?: Map<string, EvidenciaDiligencia> | undefined;
  gravando: boolean;
  cancelar: () => void;
  mudarFontes: (offset: number) => void;
  enviar: (acao: AcaoContestacao) => Promise<void>;
}) {
  const [texto, setTexto] = useState(base?.texto ?? "");
  const [fundamento, setFundamento] = useState(base?.fundamento ?? "");
  const [mapa, setMapa] = useState<EvidenciaContestacao[]>(
    () =>
      base?.mapa.map((e) => ({
        id_versao_documento: e.id_versao_documento,
        pagina: e.pagina,
        descricao: e.descricao,
        trecho: e.trecho,
        hash: e.hash,
      })) ?? [],
  );
  const [erroMapa, setErroMapa] = useState("");
  function adicionar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const fonte = dados.fontes.find((f) => f.id === form.get("documento"));
    const pagina = Number(form.get("pagina"));
    const descricao = String(form.get("afirmacao") ?? "").trim();
    const trecho = String(form.get("trecho") ?? "").trim();
    if (
      !fonte ||
      !Number.isSafeInteger(pagina) ||
      pagina < 1 ||
      !descricao ||
      !trecho ||
      mapa.length >= 40
    ) {
      setErroMapa("Informe a afirmação, o documento, a página e o trecho literal.");
      return;
    }
    if (
      mapa.some(
        (e) =>
          e.id_versao_documento === fonte.id &&
          e.pagina === pagina &&
          e.descricao === descricao &&
          e.trecho === trecho,
      )
    ) {
      setErroMapa("Essa referência já está no mapa.");
      return;
    }
    setErroMapa("");
    setMapa([
      ...mapa,
      { id_versao_documento: fonte.id, pagina, descricao, trecho, hash: fonte.hash },
    ]);
    evento.currentTarget.reset();
  }
  return (
    <section
      className="space-y-3 rounded-md border border-border p-3"
      aria-label="Nova versão da contestação"
    >
      <h3 className="font-semibold">Nova versão da contestação</h3>
      <Label htmlFor="contestacao-texto">Manifestação</Label>
      <Textarea
        id="contestacao-texto"
        value={texto}
        onChange={(e) => setTexto(e.currentTarget.value)}
        maxLength={20000}
      />
      <Label htmlFor="contestacao-fundamento">Fundamento</Label>
      <Textarea
        id="contestacao-fundamento"
        value={fundamento}
        onChange={(e) => setFundamento(e.currentTarget.value)}
        maxLength={5000}
      />
      <form className="space-y-2" onSubmit={adicionar}>
        <Label htmlFor="contestacao-documento">Versão do documento</Label>
        <select
          id="contestacao-documento"
          name="documento"
          required
          defaultValue=""
          className="block min-h-11 w-full rounded-md border border-input bg-background px-2"
        >
          <option value="" disabled>
            Selecione a versão
          </option>
          {dados.fontes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.titulo} · versão {f.numero}
              {f.vigente ? " · vigente" : ""}
            </option>
          ))}
        </select>
        <Paginacao
          nome="Documentos"
          offset={dados.offset_fontes}
          limite={20}
          total={dados.total_fontes}
          disabled={gravando}
          mudar={mudarFontes}
        />
        <Label htmlFor="contestacao-pagina">Página</Label>
        <Input id="contestacao-pagina" name="pagina" type="number" min={1} step={1} required />
        <Label htmlFor="contestacao-afirmacao">Afirmação sustentada</Label>
        <Input id="contestacao-afirmacao" name="afirmacao" required maxLength={1500} />
        <Label htmlFor="contestacao-trecho">Trecho literal da página</Label>
        <Textarea id="contestacao-trecho" name="trecho" required maxLength={2000} />
        {erroMapa && <p role="alert">{erroMapa}</p>}
        <Button
          type="submit"
          variant="outline"
          className="min-h-11"
          disabled={gravando || dados.fontes.length === 0}
        >
          Adicionar evidência ao mapa
        </Button>
      </form>
      {!!mapa.length && (
        <ol aria-label="Mapa da nova versão" className="space-y-2">
          {mapa.map((e, i) => (
            <li key={JSON.stringify(e)} className="break-words border-t border-border pt-2">
              <p>
                {e.descricao}, página {e.pagina}
              </p>
              <p>{e.trecho}</p>
              <FonteLink versao={vinculos?.get(e.id_versao_documento)} escopo={escopo} />
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                disabled={gravando}
                onClick={() => setMapa(mapa.filter((_, indice) => indice !== i))}
              >
                Remover evidência {i + 1}
              </Button>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-11"
          disabled={gravando || !mapa.length || !texto.trim() || !fundamento.trim()}
          onClick={() =>
            void enviar({
              tipo: "submeter",
              versao: versaoEsperada,
              texto: texto.trim(),
              fundamento: fundamento.trim(),
              evidencias: mapa,
            })
          }
        >
          Submeter versão
        </Button>
        <Button variant="outline" className="min-h-11" disabled={gravando} onClick={cancelar}>
          Cancelar edição
        </Button>
      </div>
    </section>
  );
}
