import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { obterVisaoGeral, parseVisaoGeral } from "@/lib/competencias/competenciaVisaoGeralDados";
import { uuidValido, uuidCanonico, formatarDataBr } from "@/lib/contratos/contratoDetalheDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { aceiteDe, enviarArquivoCertificado, motivoInvalido, obterConfiguracaoUpload, type EstadoEnvio } from "@/lib/contratos/documentosDados";
import { consultarEscopoCicloDiligencia } from "@/lib/diligencias/cicloDiligenciaDados";
import { PAGINA_DILIGENCIAS } from "@/lib/diligencias/diligenciasDados";
import { conferirApresentacaoParecer, conferirArquivoParecer, consultarProcessamentoParecer, ErroParecer, listarApresentacoesParecer, listarPareceres, listarApontamentosParecer, prepararPedidoParecer, registrarParecer, type EscopoParecer, type ParecerContratante, type PedidoParecer, type ProcessamentoParecer, type ApresentacaoParecer } from "@/lib/diligencias/pareceresContratanteDados";
import { EVENTO_ORGANIZACAO_ALTERADA, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const rotulos: Record<ProcessamentoParecer["status"], string> = {
  enfileirado: "Enfileirado", processando: "Em processamento", concluido: "Concluído",
  falhou: "Falha no processamento", cancelado: "Cancelado", indisponivel: "Indisponível",
  dispensado: "Extração dispensada",
};
const mensagens = { sem_permissao: "Sem permissão para esta operação.", invalido: "Confira os dados informados.", conflito: "O registro ou a rodada mudou. Confira a consulta.", erro: "Não foi possível confirmar o resultado. Tente novamente com a mesma intenção." };
type Dados = {
  contexto: EscopoParecer;
  ator: string;
  pareceres: Awaited<ReturnType<typeof listarPareceres>>;
  apresentacoes: Awaited<ReturnType<typeof listarApresentacoesParecer>>;
  inicial: Awaited<ReturnType<typeof conferirApresentacaoParecer>> | null;
};
type Estado = { tipo: "carregando" } | { tipo: "erro"; mensagem: string } | { tipo: "ok"; dados: Dados };

function ParecerLinha({ item, contexto, signal }: { item: ParecerContratante; contexto: EscopoParecer; signal: AbortSignal }) {
  const [estado, setEstado] = useState<{ processamento?: ProcessamentoParecer; prazo?: string | null; apresentacao?: ApresentacaoParecer | null; erro?: string }>({});
  const [revisao, setRevisao] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    const cancelar = () => ctrl.abort();
    signal.addEventListener("abort", cancelar);
    if (signal.aborted) ctrl.abort();
    setEstado({});
    void (async () => {
      try {
        const processamento = await consultarProcessamentoParecer(contexto, item, ctrl.signal);
        const [ciclo, apresentacao] = await Promise.all([
          item.id_ciclo ? consultarEscopoCicloDiligencia(item.id_ciclo, contexto.id_organizacao, ctrl.signal) : null,
          item.id_apresentacao ? conferirApresentacaoParecer(contexto, item.id_apresentacao, ctrl.signal) : null,
        ]);
        if (ciclo && (ciclo.id_competencia !== contexto.id_competencia || ciclo.id_contrato !== contexto.id_contrato)) throw new ErroParecer("sem_permissao");
        if (!ctrl.signal.aborted) setEstado({ processamento, prazo: ciclo?.prazo_resposta ?? null, apresentacao });
      } catch {
        if (!ctrl.signal.aborted) setEstado({ erro: "Processamento ou prazo indisponível para consulta." });
      }
    })();
    return () => { ctrl.abort(); signal.removeEventListener("abort", cancelar); };
  }, [contexto, item, revisao, signal]);
  return (
    <li className="space-y-3 rounded-md border border-border bg-card p-4">
      <h2 className="font-semibold break-words">{item.numero_documento || "Parecer sem número"}</h2>
      <p className="text-sm break-words">{item.resultado_geral || "Classificação não informada"}</p>
      <p className="text-sm">Recebido: {formatarDataHoraBr(item.recebido_em)}</p>
      {item.data_emissao && <p className="text-sm">Emissão: {formatarDataBr(item.data_emissao)}</p>}
      {item.parecer_final_favoravel && <p className="text-sm">Parecer final favorável</p>}
      <p role="status" className="text-sm">{estado.processamento ? rotulos[estado.processamento.status] : estado.erro || "Consultando processamento…"}</p>
      {estado.apresentacao && <p className="text-sm break-words">Protocolo: {estado.apresentacao.protocolo || "Não informado"} · Rodada {estado.apresentacao.numero_rodada}</p>}
      {estado.processamento && <p className="text-sm">Tentativas: {estado.processamento.tentativas}</p>}
      {estado.processamento?.concluido_em && <p className="text-sm">Extração concluída em: {formatarDataHoraBr(estado.processamento.concluido_em)}</p>}
      {item.id_ciclo && <p className="text-sm">Prazo: {estado.prazo ? formatarDataBr(estado.prazo) : "Pendente de confirmação"}</p>}
      <div className="flex flex-wrap gap-2">
        {item.id_apresentacao && <Button asChild variant="outline" className="min-h-11"><Link to="/competencias/$id/apresentacoes/$apresentacaoId" params={{ id: contexto.id_competencia, apresentacaoId: item.id_apresentacao }}>Protocolo original</Link></Button>}
        {item.id_ciclo && <Button asChild variant="outline" className="min-h-11"><Link to="/diligencias/$cicloId" params={{ cicloId: item.id_ciclo }}>Abrir rodada</Link></Button>}
        <Button variant="outline" className="min-h-11" onClick={() => setRevisao(v => v + 1)}>Atualizar processamento</Button>
      </div>
      {estado.processamento?.status === "concluido" && item.id_ciclo && <ApontamentosDoParecer item={item} contexto={contexto} signal={signal} />}
    </li>
  );
}

function ApontamentosDoParecer({ item, contexto, signal }: { item: ParecerContratante; contexto: EscopoParecer; signal: AbortSignal }) {
  const [aberto, setAberto] = useState(false);
  const [offset, setOffset] = useState(0);
  const [pagina, setPagina] = useState<{ offset: number; dados: Awaited<ReturnType<typeof listarApontamentosParecer>> | null } | null>(null);
  useEffect(() => {
    if (!aberto) return;
    const ctrl = new AbortController();
    const abortar = () => ctrl.abort();
    signal.addEventListener("abort", abortar);
    if (signal.aborted) ctrl.abort();
    void listarApontamentosParecer(contexto, item, offset, ctrl.signal).then(dados => {
      if (!ctrl.signal.aborted) setPagina({ offset, dados });
    }).catch(() => { if (!ctrl.signal.aborted) setPagina({ offset, dados: null }); });
    return () => { ctrl.abort(); signal.removeEventListener("abort", abortar); };
  }, [aberto, contexto, item, offset, signal]);
  const atual = pagina?.offset === offset ? pagina : null;
  return <section aria-label="Apontamentos extraídos" className="space-y-2 border-t border-border pt-3">
    <Button type="button" variant="outline" aria-expanded={aberto} onClick={() => { setPagina(null); setAberto(v => !v); }}>{aberto ? "Ocultar apontamentos" : "Consultar apontamentos extraídos"}</Button>
    {aberto && (!atual ? <p role="status">Conferindo as origens dos apontamentos…</p> : !atual.dados ? <p role="alert">Não foi possível confirmar os vínculos com este parecer.</p> : <>
      {!atual.dados.itens.length && <p role="status">Nenhum vínculo confirmado nesta página da rodada.</p>}
      <ul className="space-y-2">{atual.dados.itens.map(a => <li key={a.id} className="break-words text-sm"><Link className="underline" to="/diligencias/$cicloId/apontamentos/$id" params={{ cicloId: a.id_ciclo, id: a.id }}>{a.codigo || "Apontamento"}: {a.descricao}</Link></li>)}</ul>
      <nav aria-label="Paginação dos apontamentos da rodada" className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!offset} onClick={() => setOffset(v => v - PAGINA_DILIGENCIAS)}>Anteriores</Button>
        <Button variant="outline" disabled={offset + PAGINA_DILIGENCIAS >= atual.dados.totalCandidatos} onClick={() => setOffset(v => v + PAGINA_DILIGENCIAS)}>Próximos</Button>
      </nav>
    </>)}
  </section>;
}

export function PareceresContratante({ id, apresentacaoId }: { id: string; apresentacaoId?: string }) {
  const navigate = useNavigate();
  const chave = id + ":" + (apresentacaoId ?? "");
  const atual = useRef<AbortController | null>(null);
  const [versao, setVersao] = useState(0);
  const [offset, setOffset] = useState(0);
  const [offsetAp, setOffsetAp] = useState(0);
  const chaveConsulta = chave + ":" + versao + ":" + offset + ":" + offsetAp;
  const [travaConsulta, setTravaConsulta] = useState<string | null>(null);
  const consultaTravada = travaConsulta === chaveConsulta;
  const [resposta, setResposta] = useState<{ chave: string; versao: number; offset: number; offsetAp: number; estado: Estado } | null>(null);
  const estado: Estado = resposta?.chave === chave && resposta.versao === versao && resposta.offset === offset && resposta.offsetAp === offsetAp
    ? resposta.estado : { tipo: "carregando" };
  useEffect(() => {
    const reiniciar = () => { atual.current?.abort(); setTravaConsulta(null); setOffset(0); setOffsetAp(0); setVersao(v => v + 1); };
    const { data } = supabase.auth.onAuthStateChange(evento => { if (evento !== "INITIAL_SESSION") reiniciar(); });
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, reiniciar);
    return () => { data.subscription.unsubscribe(); window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, reiniciar); };
  }, []);
  useEffect(() => {
    const ctrl = new AbortController();
    atual.current = ctrl;
    const signal = ctrl.signal;
    const exibir = (estado: Estado) => { if (!signal.aborted) setResposta({ chave, versao, offset, offsetAp, estado }); };
    void (async () => {
      try {
        if (!uuidValido(id) || (apresentacaoId !== undefined && !uuidValido(apresentacaoId))) throw new ErroParecer("invalido");
        const sessao = await supabase.auth.getUser();
        signal.throwIfAborted();
        if (!sessao.error && !sessao.data.user || sessao.error?.name === "AuthSessionMissingError") { void navigate({ to: "/login", replace: true }); return; }
        if (sessao.error || !sessao.data.user) throw new ErroParecer("sem_permissao");
        const ator = sessao.data.user.id;
        const org = obterPreferenciaOrganizacao(ator);
        if (!org || !uuidValido(org)) { void navigate({ to: "/selecionar-organizacao", replace: true }); return; }
        const r = await obterVisaoGeral(uuidCanonico(id), signal);
        signal.throwIfAborted();
        if (r.error) throw new ErroParecer(r.status === 401 || r.status === 403 ? "sem_permissao" : "erro");
        const vg = parseVisaoGeral(r.data);
        if (!vg || vg.competencia.id !== uuidCanonico(id) || vg.competencia.id_organizacao !== uuidCanonico(org) || !uuidValido(vg.competencia.id_contrato)) throw new ErroParecer("sem_permissao");
        const contexto = { id_competencia: vg.competencia.id, id_organizacao: vg.competencia.id_organizacao, id_contrato: vg.competencia.id_contrato };
        const [pareceres, apresentacoes, inicial] = await Promise.all([
          listarPareceres(contexto, offset, signal), listarApresentacoesParecer(contexto, offsetAp, signal),
          apresentacaoId ? conferirApresentacaoParecer(contexto, uuidCanonico(apresentacaoId), signal) : null,
        ]);
        if (obterPreferenciaOrganizacao(ator) !== org) throw new ErroParecer("sem_permissao");
        exibir({ tipo: "ok", dados: { contexto, ator, pareceres, apresentacoes, inicial } });
      } catch (e) { exibir({ tipo: "erro", mensagem: e instanceof ErroParecer ? mensagens[e.tipo] : mensagens.erro }); }
    })();
    return () => ctrl.abort();
  }, [id, apresentacaoId, chave, versao, offset, offsetAp, navigate]);
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
    <Button asChild variant="ghost" className="min-h-11"><Link to="/competencias/$id/diligencias" params={{ id }}>Voltar às diligências</Link></Button>
    <header><h1 className="text-2xl font-semibold tracking-tight">Pareceres do contratante</h1><p className="text-sm text-muted-foreground">Registro oficial e acompanhamento da extração.</p></header>
    <Button variant="outline" disabled={consultaTravada} onClick={() => setVersao(v => v + 1)} className="min-h-11">Atualizar consulta</Button>
    {estado.tipo === "carregando" ? <p role="status">Consultando pareceres…</p> : estado.tipo === "erro" ? <p role="alert">{estado.mensagem}</p> : atual.current && <div key={chave + ":" + versao + ":" + offset + ":" + offsetAp} className="space-y-5">
      <RegistroParecer dados={estado.dados} signal={atual.current.signal} onTrava={travar => setTravaConsulta(valor => travar ? chaveConsulta : valor === chaveConsulta ? null : valor)} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={consultaTravada || !offsetAp} onClick={() => setOffsetAp(v => v - PAGINA_DILIGENCIAS)}>Apresentações anteriores</Button>
        <Button variant="outline" disabled={consultaTravada || offsetAp + PAGINA_DILIGENCIAS >= estado.dados.apresentacoes.total} onClick={() => setOffsetAp(v => v + PAGINA_DILIGENCIAS)}>Próximas apresentações</Button>
      </div>
      <section aria-label="Pareceres recebidos" className="space-y-3">
        {!estado.dados.pareceres.total && <p role="status">Nenhum parecer recebido.</p>}
        <ul className="space-y-3">{estado.dados.pareceres.itens.map(item => <ParecerLinha key={item.id} item={item} contexto={estado.dados.contexto} signal={atual.current!.signal} />)}</ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={consultaTravada || !offset} onClick={() => setOffset(v => v - PAGINA_DILIGENCIAS)}>Pareceres anteriores</Button>
          <Button variant="outline" disabled={consultaTravada || offset + PAGINA_DILIGENCIAS >= estado.dados.pareceres.total} onClick={() => setOffset(v => v + PAGINA_DILIGENCIAS)}>Próximos pareceres</Button>
        </div>
      </section>
    </div>}
  </main>;
}

function RegistroParecer({ dados, signal, onTrava }: { dados: Dados; signal: AbortSignal; onTrava: (travar: boolean) => void }) {
  const [pedido, setPedido] = useState<PedidoParecer>({ apresentacao: dados.inicial?.id ?? "", arquivo: "", resultado: "", finalFavoravel: false, numero: "", emissao: "", prazo: "" });
  const [file, setFile] = useState<File | null>(null);
  const envio = useRef<EstadoEnvio>({});
  const trava = useRef(false);
  const intencao = useRef<PedidoParecer | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [fixado, setFixado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [confirmado, setConfirmado] = useState("");
  const [aceite, setAceite] = useState("");
  useEffect(() => {
    void obterConfiguracaoUpload(signal).then(c => { if (!signal.aborted) setAceite(aceiteDe(c)); }).catch(() => { if (!signal.aborted) setMensagem("Configuração de envio indisponível."); });
  }, [signal]);
  const conferirContexto = async () => {
    signal.throwIfAborted();
    const r = await supabase.auth.getUser();
    signal.throwIfAborted();
    if (r.error || r.data.user?.id !== dados.ator || obterPreferenciaOrganizacao(dados.ator) !== dados.contexto.id_organizacao) throw new ErroParecer("sem_permissao");
  };
  const enviar = async () => {
    if (trava.current || !file || signal.aborted) return;
    trava.current = true; onTrava(true); setOcupado(true); setMensagem("");
    try {
      await conferirContexto();
      const config = await obterConfiguracaoUpload(signal);
      if (motivoInvalido(file, config)) throw new ErroParecer("invalido");
      setFixado(true);
      const idArquivo = await enviarArquivoCertificado(dados.contexto.id_organizacao, dados.contexto.id_contrato, file, envio.current);
      await conferirContexto();
      setPedido(p => ({ ...p, arquivo: idArquivo }));
      try {
        await conferirArquivoParecer(dados.contexto, idArquivo, signal);
        if (!signal.aborted) setMensagem("Arquivo aprovado para registro.");
      } catch {
        if (!signal.aborted) setMensagem("Arquivo enviado. Aguarde ou confira a aprovação antes de registrar.");
      }
    } catch (e) { if (!signal.aborted) setMensagem(e instanceof ErroParecer ? mensagens[e.tipo] : "Envio não confirmado. Retome o mesmo arquivo."); }
    finally { trava.current = false; if (!signal.aborted) { setOcupado(false); onTrava(false); } }
  };
  const registrar = async () => {
    if (trava.current || signal.aborted || confirmado) return;
    trava.current = true; onTrava(true); setOcupado(true); setMensagem("");
    let resultadoIncerto = intencao.current !== null;
    try {
      await conferirContexto();
      const p = intencao.current ?? prepararPedidoParecer(pedido);
      await conferirArquivoParecer(dados.contexto, p.arquivo, signal);
      await conferirContexto();
      intencao.current = p; setFixado(true);
      resultadoIncerto = true;
      const idParecer = await registrarParecer(dados.contexto, p, signal);
      await conferirContexto();
      resultadoIncerto = false;
      setConfirmado(idParecer); setMensagem("Registro confirmado pelo servidor. Atualize a consulta para conferir a rodada e o prazo.");
    } catch (e) {
      if (e instanceof ErroParecer && e.tipo !== "erro") resultadoIncerto = false;
      if (!signal.aborted) setMensagem(e instanceof ErroParecer ? mensagens[e.tipo] : mensagens.erro);
    }
    finally { trava.current = false; if (!signal.aborted) { setOcupado(false); onTrava(resultadoIncerto); } }
  };
  const apresentacoes = dados.inicial && !dados.apresentacoes.itens.some(a => a.id === dados.inicial?.id) ? [dados.inicial, ...dados.apresentacoes.itens] : dados.apresentacoes.itens;
  const bloqueado = ocupado || !!intencao.current || !!confirmado;
  return <section aria-label="Registrar parecer" className="space-y-4 rounded-lg border border-border bg-card p-4">
    <h2 className="text-lg font-semibold">Registrar parecer</h2>
    <form className="grid gap-3" onSubmit={e => { e.preventDefault(); void registrar(); }}>
      <div className="grid gap-1 text-sm">
        <label htmlFor="parecer-apresentacao">Apresentação</label>
        <select id="parecer-apresentacao" className="min-h-11 rounded border border-input bg-background px-2" required disabled={bloqueado || !!dados.inicial} value={pedido.apresentacao} onChange={e => setPedido(p => ({ ...p, apresentacao: e.target.value }))}>
          <option value="">Selecione a apresentação</option>{apresentacoes.map(a => <option key={a.id} value={a.id}>{a.protocolo || "Sem protocolo"} · Rodada {a.numero_rodada}</option>)}
        </select>
      </div>
      <label className="grid gap-1 text-sm">Classificação<input className="min-h-11 rounded border border-input bg-background px-2" required maxLength={200} disabled={bloqueado} value={pedido.resultado} onChange={e => setPedido(p => ({ ...p, resultado: e.target.value }))}/></label>
      <label className="grid gap-1 text-sm">Número do documento<input className="min-h-11 rounded border border-input bg-background px-2" maxLength={120} disabled={bloqueado} value={pedido.numero} onChange={e => setPedido(p => ({ ...p, numero: e.target.value }))}/></label>
      <label className="grid gap-1 text-sm">Data de emissão<input className="min-h-11 rounded border border-input bg-background px-2" type="date" disabled={bloqueado} value={pedido.emissao} onChange={e => setPedido(p => ({ ...p, emissao: e.target.value }))}/></label>
      <label className="grid gap-1 text-sm">Prazo de resposta<input className="min-h-11 rounded border border-input bg-background px-2" type="date" disabled={bloqueado} value={pedido.prazo} onChange={e => setPedido(p => ({ ...p, prazo: e.target.value }))}/></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={bloqueado} checked={pedido.finalFavoravel} onChange={e => setPedido(p => ({ ...p, finalFavoravel: e.target.checked }))}/>Parecer final favorável</label>
      <label className="grid gap-1 text-sm">Arquivo privado<input type="file" accept={aceite} disabled={bloqueado || fixado} onChange={e => { setFile(e.target.files?.[0] ?? null); envio.current = {}; }}/></label>
      <Button type="button" variant="outline" disabled={bloqueado || !file || !!pedido.arquivo} onClick={() => void enviar()}>Enviar ou retomar arquivo</Button>
      <Button type="submit" disabled={ocupado || !pedido.arquivo || !!confirmado || !pedido.apresentacao || !pedido.resultado.trim()}>{intencao.current ? "Repetir registro" : "Registrar parecer"}</Button>
      {mensagem && <p role="status" className="text-sm break-words">{mensagem}</p>}
    </form>
  </section>;
}
