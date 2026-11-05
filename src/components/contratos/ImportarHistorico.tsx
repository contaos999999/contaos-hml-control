import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, FileUp, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { obterContrato, uuidCanonico, uuidValido, type ContratoDetalhe } from "@/lib/contratos/contratoDetalheDados";
import {
  aceiteDe, criarDocumentoCompleto, enviarArquivoCertificado,
  obterConfiguracaoUpload, validarArquivo, type ConfigUpload, type EstadoEnvio,
  type RetornoDocumento,
} from "@/lib/contratos/documentosDados";
import {
  consultarEstadoDocumentoHistorico, enfileirarRelatorioHistorico,
  mensagemErroIngestao, podeFinalizarIngestao, registrarRelatorioHistorico,
  TIPOS_RELATORIO_HISTORICO, type TipoRelatorioHistorico,
  vincularTratamentoHistorico,
} from "@/lib/contratos/ingestaoHistoricoDados";
import {
  listarRelatoriosHistoricos, listarApontamentosVinculados,
  type RelatorioHistorico, type ApontamentoVinculado, PAGINA_HISTORICO,
} from "@/lib/contratos/historicoContratoDados";

type Ctx = { org: string; contrato: ContratoDetalhe; usuario: string };
type Gate = { fase: "carregando" | "erro" | "sem_permissao" | "nao_encontrado" } | {fase:"ok";ctx:Ctx};
type Etapa = "selecionado" | "enviando" | "aguardando" | "pronto" | "enfileirado" | "erro" | "bloqueado";
type Item = {
  chave: string; arquivo: File; competencia: string; tipo: TipoRelatorioHistorico;
  etapa: Etapa; porcentagem: number; seguranca: string; processamento: string; aviso: string;
};
type Trabalho = { envio: EstadoEnvio; comando: string; documento?: RetornoDocumento; relatorio?: string; execucao?: string };
const ESTADOS: Record<Etapa, string> = {
  selecionado: "Pronto para enviar", enviando: "Enviando ao armazenamento privado",
  aguardando: "Aguardando segurança e leitura documental", pronto: "Pronto para ingestão histórica",
  enfileirado: "Enfileirado para análise histórica", erro: "Requer atenção", bloqueado: "Bloqueado pela segurança",
};
const CAMPO = "min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const FORMATO_COMPETENCIA = /^20\d{2}-(?:0[1-9]|1[0-2])$/;

export function ImportarHistorico({ id }: { id: string }) {
  const navigate=useNavigate();
  const [tentativa,setTentativa]=useState(0);
  const [gate,setGate]=useState<Gate>({fase:"carregando"});
  useEffect(()=>{
    const abort=new AbortController();
    setGate({fase:"carregando"});
    if(!uuidValido(id)){setGate({fase:"nao_encontrado"});return ()=>abort.abort();}
    void (async()=>{
      try{
        const {data,error}=await supabase.auth.getUser();
        if(abort.signal.aborted)return;
        const missing=!!error && ((error as {name?:string}).name==="AuthSessionMissingError" ||
          (error as {code?:string}).code==="session_not_found");
        if(missing||(!error&&!data.user)){void navigate({to:"/login",replace:true});return;}
        if(error||!data.user){setGate({fase:"erro"});return;}
        const org=obterPreferenciaOrganizacao(data.user.id);
        if(!org){void navigate({to:"/selecionar-organizacao",replace:true});return;}
        const [contrato,orgs]=await Promise.all([
          obterContrato(id,abort.signal),listarOrganizacoesDisponiveis(),
        ]);
        if(abort.signal.aborted)return;
        if(uuidCanonico(contrato.id)!==uuidCanonico(id) ||
           uuidCanonico(contrato.id_organizacao)!==uuidCanonico(org)){setGate({fase:"sem_permissao"});return;}
        const perfil=orgs.find(x=>x.id && uuidValido(x.id) &&
          uuidCanonico(x.id)===uuidCanonico(org) && x.situacao==="ativa")?.perfil;
        if(!perfil||!["administrador","gestor_contrato","administrador_master"].includes(perfil)){
          setGate({fase:"sem_permissao"});return;
        }
        setGate({fase:"ok",ctx:{org,contrato,usuario:data.user.id}});
      }catch(e){
        if(abort.signal.aborted)return;
        const tipo=(e && typeof e==="object" && "tipo" in e)?e.tipo:null;
        setGate({fase:tipo==="nao_encontrado"?"nao_encontrado":tipo==="negado"?"sem_permissao":"erro"});
      }
    })();
    return ()=>abort.abort();
  },[id,navigate,tentativa]);
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <ContaOSMarca />
        <Button asChild variant="secondary" className="min-h-11">
          <Link to="/contratos/$id/historico" params={{id}}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden/> Voltar ao histórico</Link>
        </Button>
      </div>
    </header>
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gestão contratual</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Importação de histórico</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Envie relatórios anteriores e associe cada arquivo à competência correta. A aprovação e a análise ocorrem no backend, com revisão humana quando necessária.
        </p>
      </div>
      {gate.fase==="carregando"?<p role="status"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden/>Verificando acesso…</p>:
       gate.fase!=="ok"?<div role="alert" className="rounded-lg border border-destructive/40 bg-card p-4">
        <ShieldAlert className="mr-2 inline h-4 w-4 text-destructive" aria-hidden/>
        {gate.fase==="sem_permissao"?"Seu perfil não possui permissão para importar histórico neste contrato.":
         gate.fase==="nao_encontrado"?"Contrato não encontrado.":"Não foi possível confirmar o acesso ao contrato."}
        <Button variant="outline" className="ml-3 min-h-11" onClick={()=>setTentativa(t=>t+1)}>Tentar novamente</Button>
       </div>:
       <Conteudo key={gate.ctx.usuario+gate.ctx.org+gate.ctx.contrato.id} ctx={gate.ctx}/>}
    </main>
  </div>;
}
function Conteudo({ctx}:{ctx:Ctx}){
  const [config,setConfig]=useState<ConfigUpload|null|"erro">(null);
  const [itens,setItens]=useState<Item[]>([]);
  const refs=useRef(new Map<string,Trabalho>());
  const trava=useRef(new Set<string>());
  const [lendo,setLendo]=useState(false);
  const [enviandoLote,setEnviandoLote]=useState(false);
  const bloqueioLote=useRef(false);
  useEffect(()=>{
    const ctrl=new AbortController();
    obterConfiguracaoUpload(ctrl.signal).then(setConfig).catch(()=>{if(!ctrl.signal.aborted)setConfig("erro");});
    return ()=>ctrl.abort();
  },[]);
  const alterar=useCallback((chave:string,delta:Partial<Item>)=>{
    setItens(antes=>antes.map(i=>i.chave===chave?{...i,...delta}:i));
  },[]);
  const adicionar=(e:ChangeEvent<HTMLInputElement>)=>{
    const f=Array.from(e.target.files??[]);
    setItens(antes=>[...antes,...f.map(arquivo=>({
      chave:crypto.randomUUID(),arquivo,competencia:"",tipo:"relatorio_contratante" as TipoRelatorioHistorico,
      etapa:"selecionado" as Etapa,porcentagem:0,seguranca:"pendente",processamento:"pendente",aviso:"",
    }))]);
    e.target.value="";
  };
  const enviar=async(i:Item)=>{
    if(trava.current.has(i.chave) || !config || config==="erro")return;
    if(!FORMATO_COMPETENCIA.test(i.competencia)){alterar(i.chave,{etapa:"erro",aviso:"Informe mês e ano válidos para a competência."});return;}
    const erro=validarArquivo(i.arquivo,config);
    if(erro){alterar(i.chave,{etapa:"erro",aviso:erro});return;}
    trava.current.add(i.chave);
    const t=refs.current.get(i.chave)??{envio:{},comando:crypto.randomUUID()};
    refs.current.set(i.chave,t);
    alterar(i.chave,{etapa:"enviando",aviso:""});
    try{
      const idArquivo=await enviarArquivoCertificado(ctx.org,ctx.contrato.id,i.arquivo,t.envio,{
        onProgresso:porcentagem=>alterar(i.chave,{porcentagem}),
      });
      if(!t.documento){
        t.documento=await criarDocumentoCompleto(ctx.contrato.id,{
          tipo:"outro",titulo:`Histórico — ${i.arquivo.name}`,categoria:"historico",
          vigenciaInicio:"",vigenciaFim:"",observacoes:`Competência informada: ${i.competencia}`,
        },idArquivo,t.comando);
      }
      if(t.documento.id_arquivo!==idArquivo)throw new Error("inconsistente");
      alterar(i.chave,{etapa:"aguardando",aviso:"Upload registrado. A aprovação de segurança e a extração documental ainda são necessárias."});
    }catch(e){alterar(i.chave,{etapa:"erro",aviso:mensagemErroIngestao(e)});}
    finally{trava.current.delete(i.chave);}
  };
  const atualizarEstado=async(i:Item)=>{
    const t=refs.current.get(i.chave);
    if(!t?.documento||trava.current.has(i.chave))return;
    trava.current.add(i.chave);setLendo(true);
    const controller=new AbortController();
    try{
      const estado=await consultarEstadoDocumentoHistorico(ctx.org,ctx.contrato.id,t.documento.id_arquivo,t.documento.id_versao,controller.signal);
      alterar(i.chave,{
        seguranca:estado.seguranca,processamento:estado.processamento,
        etapa:estado.seguranca==="bloqueado"||estado.seguranca==="quarentena"?"bloqueado":
          podeFinalizarIngestao(estado.seguranca,estado.processamento)?"pronto":
          estado.processamento==="falhou"?"erro":"aguardando",
        aviso:estado.processamento==="falhou"?"A leitura documental falhou. Revise o documento na central de documentos.":
          estado.seguranca==="bloqueado"||estado.seguranca==="quarentena"?"Documento retido pela segurança. Não é possível importar.":
          podeFinalizarIngestao(estado.seguranca,estado.processamento)?"Arquivo liberado pelo backend para ingestão.":
          "Aguarde a aprovação de segurança e a conclusão do processamento documental.",
      });
    }catch(e){alterar(i.chave,{etapa:"erro",aviso:mensagemErroIngestao(e)});}
    finally{controller.abort();setLendo(false);trava.current.delete(i.chave);}
  };
  const finalizar=async(i:Item)=>{
    const t=refs.current.get(i.chave);
    if(!t?.documento || trava.current.has(i.chave) || i.etapa!=="pronto")return;
    trava.current.add(i.chave);
    const ctrl=new AbortController();
    try{
      const estado=await consultarEstadoDocumentoHistorico(ctx.org,ctx.contrato.id,t.documento.id_arquivo,t.documento.id_versao,ctrl.signal);
      if(!podeFinalizarIngestao(estado.seguranca,estado.processamento)){
        alterar(i.chave,{etapa:"aguardando",aviso:"O arquivo ainda não está liberado pelo processamento documental."});return;
      }
      if(!t.relatorio)t.relatorio=await registrarRelatorioHistorico(t.documento.id_arquivo,i.competencia,i.tipo);
      if(!t.execucao)t.execucao=await enfileirarRelatorioHistorico(t.relatorio,t.documento.id_versao);
      alterar(i.chave,{etapa:"enfileirado",aviso:"A ingestão foi colocada na fila. Consulte o histórico para acompanhar o resultado."});
    }catch(e){alterar(i.chave,{etapa:"erro",aviso:mensagemErroIngestao(e)});}
    finally{ctrl.abort();trava.current.delete(i.chave);}
  };
  const enviarLote=async()=>{
    if(bloqueioLote.current)return;
    bloqueioLote.current=true;setEnviandoLote(true);
    try{
      // Execução sequencial preserva progressos independentes e permite falha parcial.
      for(const item of itens){
        if(!refs.current.get(item.chave)?.documento && item.etapa!=="enfileirado"){
          await enviar(item);
        }
      }
    }finally{bloqueioLote.current=false;setEnviandoLote(false);}
  };
  const total=itens.length;
  const permitidos=config!==null&&config!=="erro";
  return <div className="space-y-6">
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">Contrato {ctx.contrato.numero}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{ctx.contrato.objeto}</p>
      <p className="mt-2 text-xs text-muted-foreground">A importação não aprova automaticamente documentos nem cria regras preventivas vinculantes.</p>
    </section>
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">1. Selecionar relatórios anteriores</h2>
      {config===null?<p role="status">Carregando configurações de upload…</p>:
        config==="erro"?<p role="alert" className="text-sm text-destructive">Não foi possível obter os formatos permitidos. Atualize a página antes de enviar.</p>:
        <p className="text-sm text-muted-foreground">Formatos aceitos: {config.extensoes.join(", ").toUpperCase()}. O limite de tamanho e o tipo real são conferidos pelo backend.</p>}
      <label htmlFor="historico-arquivos" className="block text-sm font-medium">Arquivos históricos (seleção múltipla)</label>
      <input id="historico-arquivos" type="file" multiple className={CAMPO} disabled={!permitidos||enviandoLote}
        accept={config && config!=="erro" ? aceiteDe(config) : undefined} onChange={adicionar}/>
      <p role="status" className="text-sm text-muted-foreground">{total===0?"Nenhum arquivo selecionado.":`${total} arquivo(s) selecionado(s).`}</p>
      {total>1&&<div className="space-y-1">
        <Button type="button" className="min-h-11" disabled={!permitidos||enviandoLote}
          onClick={()=>void enviarLote()}>
          <FileUp className="mr-2 h-4 w-4" aria-hidden/> Enviar arquivos pendentes em sequência
        </Button>
        <p role="status" className="text-xs text-muted-foreground">
          {enviandoLote?"Enviando o lote. Cada arquivo conserva seu estado e pode exigir correção individual.":"Defina a competência e o tipo de cada arquivo antes de enviar. Falhas em um documento não impedem os demais."}
        </p>
      </div>}
    </section>
    {itens.length>0&&<section className="space-y-3" aria-label="Arquivos selecionados">
      <h2 className="text-lg font-semibold">2. Competência e processamento por arquivo</h2>
      {itens.map((i,indice)=>{
        const enviando=trava.current.has(i.chave)||enviandoLote;
        const persistido=refs.current.get(i.chave);
        const iniciado=!!persistido?.documento;
        return <article key={i.chave} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h3 className="break-words font-semibold">{indice+1}. {i.arquivo.name}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`hist-competencia-${i.chave}`} className="block text-sm font-medium">Competência (mês/ano)</label>
              <input id={`hist-competencia-${i.chave}`} className={CAMPO} type="month" value={i.competencia}
                disabled={iniciado||enviando}
                onChange={e=>alterar(i.chave,{competencia:e.target.value,aviso:"",etapa:"selecionado"})}/>
            </div>
            <div>
              <label htmlFor={`hist-tipo-${i.chave}`} className="block text-sm font-medium">Tipo de relatório</label>
              <select id={`hist-tipo-${i.chave}`} className={CAMPO} value={i.tipo} disabled={iniciado||enviando}
                onChange={e=>alterar(i.chave,{tipo:e.target.value as TipoRelatorioHistorico,aviso:"",etapa:"selecionado"})}>
                {TIPOS_RELATORIO_HISTORICO.map(t=><option key={t.codigo} value={t.codigo}>{t.rotulo}</option>)}
              </select>
            </div>
          </div>
          <p role="status" aria-live="polite" className="text-sm"><span className="font-medium">{ESTADOS[i.etapa]}.</span> {i.etapa==="enviando"?`${i.porcentagem}%`:""}</p>
          {i.aviso&&<p role={i.etapa==="erro"||i.etapa==="bloqueado"?"alert":"status"} className="text-sm text-muted-foreground">{i.aviso}</p>}
          {iniciado&&<p className="text-xs text-muted-foreground">Segurança: {i.seguranca}. Leitura documental: {i.processamento}. A fila histórica exige ambos liberados.</p>}
          <div className="flex flex-wrap gap-2">
            {!iniciado&&i.etapa!=="enfileirado"&&
              <Button className="min-h-11" disabled={!permitidos||enviando} onClick={()=>void enviar(i)}>
                <FileUp className="mr-2 h-4 w-4" aria-hidden/> Enviar documento
              </Button>}
            {iniciado&&i.etapa!=="enfileirado"&&i.etapa!=="bloqueado"&&
              <Button variant="outline" className="min-h-11" disabled={enviando||lendo} onClick={()=>void atualizarEstado(i)}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden/> Verificar processamento
              </Button>}
            {iniciado&&i.etapa==="pronto"&&
              <Button className="min-h-11" disabled={enviando} onClick={()=>void finalizar(i)}>
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden/> Enfileirar ingestão
              </Button>}
            {!iniciado&&!enviando&&<Button variant="ghost" className="min-h-11"
              onClick={()=>setItens(anteriores=>anteriores.filter(x=>x.chave!==i.chave))}>Remover</Button>}
          </div>
        </article>;
      })}
    </section>}
    <section className="space-y-2 rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">3. Revisar apontamentos e respostas</h2>
      <p className="text-sm text-muted-foreground">A análise histórica preserva documento, página e trecho. Relatórios com itens não identificados exigem conferência humana; nenhuma regra é aprovada automaticamente.</p>
      <RevisaoHistorico key={ctx.contrato.id+ctx.org} org={ctx.org} contrato={ctx.contrato.id}/>
    </section>
  </div>;
}
function RevisaoHistorico({org,contrato}:{org:string;contrato:string}){
  const [offset,setOffset]=useState(0),[versao,setVersao]=useState(0);
  const [paginaAp,setPaginaAp]=useState(0);
  const [totalAp,setTotalAp]=useState(0);
  const [lendoAp,setLendoAp]=useState(false);
  const [relatorios,setRelatorios]=useState<{itens:RelatorioHistorico[];total:number}|null>(null);
  const [relatorio,setRelatorio]=useState<string|null>(null);
  const [apontamentos,setApontamentos]=useState<ApontamentoVinculado[]>([]);
  const [erro,setErro]=useState("");
  const [carregando,setCarregando]=useState(false);
  const [resposta,setResposta]=useState(""),[desfecho,setDesfecho]=useState(""),[fundamento,setFundamento]=useState("");
  const [emEdicao,setEmEdicao]=useState<string|null>(null);
  const [salvando,setSalvando]=useState(false);
  const travaTratamento=useRef(false);
  const limparTratamento=()=>{setEmEdicao(null);setResposta("");setDesfecho("");setFundamento("");};
  const selecionar=(id:string)=>{
    setRelatorio(atual=>atual===id?null:id);
    setApontamentos([]);setTotalAp(0);setPaginaAp(0);limparTratamento();setErro("");
  };
  useEffect(()=>{
    const ctrl=new AbortController();
    setCarregando(true);setErro("");
    listarRelatoriosHistoricos(contrato,org,offset,ctrl.signal)
      .then(r=>{if(!ctrl.signal.aborted)setRelatorios(r);})
      .catch(e=>{if(!ctrl.signal.aborted)setErro(mensagemErroIngestao(e));})
      .finally(()=>{if(!ctrl.signal.aborted)setCarregando(false);});
    return ()=>ctrl.abort();
  },[org,contrato,offset,versao]);
  useEffect(()=>{
    if(!relatorio){setApontamentos([]);setTotalAp(0);return;}
    const ctrl=new AbortController();
    setLendoAp(true);setApontamentos([]);setTotalAp(0);setErro("");
    listarApontamentosVinculados(contrato,org,relatorio,paginaAp,ctrl.signal)
      .then(r=>{if(!ctrl.signal.aborted){setApontamentos(r.itens);setTotalAp(r.total);}})
      .catch(e=>{if(!ctrl.signal.aborted)setErro(mensagemErroIngestao(e));})
      .finally(()=>{if(!ctrl.signal.aborted)setLendoAp(false);});
    return ()=>ctrl.abort();
  },[org,contrato,relatorio,paginaAp,versao]);
  const guardar=async(id:string)=>{
    if(travaTratamento.current)return;
    travaTratamento.current=true;setSalvando(true);setErro("");
    try{
      await vincularTratamentoHistorico(id,resposta,desfecho,fundamento);
      limparTratamento();setVersao(n=>n+1);
    }catch{
      setErro("Não foi possível confirmar a gravação. Atualize o histórico antes de tentar novamente para evitar duplicidade.");
    }finally{travaTratamento.current=false;setSalvando(false);}
  };
  return <div className="space-y-3">
    <Button variant="outline" className="min-h-11" onClick={()=>setVersao(v=>v+1)} disabled={carregando}><RefreshCw className="mr-2 h-4 w-4" aria-hidden/> Atualizar histórico</Button>
    {carregando?<p role="status" className="text-sm">Consultando relatórios…</p>:null}
    {erro?<p role="alert" className="flex gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" aria-hidden/>{erro}</p>:null}
    {relatorios?.itens.length===0?<p className="text-sm text-muted-foreground">Ainda não existem relatórios históricos registrados neste contrato.</p>:null}
    <ul className="space-y-2">
      {relatorios?.itens.map(r=><li key={r.id} className="rounded-md border border-border p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{r.tipo} · Competência {r.competencia_referencia? r.competencia_referencia.slice(0,7).split("-").reverse().join("/"): "não informada"} · {r.status_processamento}</span>
          <Button variant="outline" className="min-h-11" onClick={()=>selecionar(r.id)}> {r.id===relatorio?"Ocultar":"Ver apontamentos"}</Button>
        </div>
      </li>)}
    </ul>
    {relatorios&&relatorios.total>PAGINA_HISTORICO&&<div className="flex gap-2">
      <Button variant="outline" disabled={offset===0} onClick={()=>{setOffset(o=>Math.max(0,o-PAGINA_HISTORICO));setRelatorio(null);setApontamentos([]);limparTratamento();}}>Anterior</Button>
      <span className="text-sm">Página {Math.floor(offset/PAGINA_HISTORICO)+1}</span>
      <Button variant="outline" disabled={offset+PAGINA_HISTORICO>=relatorios.total} onClick={()=>{setOffset(o=>o+PAGINA_HISTORICO);setRelatorio(null);setApontamentos([]);limparTratamento();}}>Próxima</Button>
    </div>}
    {relatorio&&<div className="space-y-2" aria-label="Apontamentos do relatório">
      <h3 className="font-medium">Apontamentos registrados</h3>
      {lendoAp?<p role="status" className="text-sm">Carregando apontamentos da página…</p>:
        apontamentos.length===0&&!erro&&<p className="text-sm text-muted-foreground">Nenhum apontamento localizado. Revise o conteúdo original, inclusive itens sem marcadores.</p>}
      {apontamentos.map(a=><div key={a.id} className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium">{a.item??"Item sem número"}: {a.problema}</p>
        <p className="text-xs text-muted-foreground">Página {a.fonte_pagina??"não informada"} · {a.fundamento??"Fundamento não informado"}</p>
        <p className="text-xs">Respostas: {a.respostas.length} · Desfechos: {a.desfechos.length}</p>
        <Button className="min-h-11" variant="outline" disabled={salvando} onClick={()=>{limparTratamento();setEmEdicao(emEdicao===a.id?null:a.id);}}>Registrar tratamento</Button>
        {emEdicao===a.id&&<div className="space-y-2">
          <label className="block text-sm">Resposta<textarea className={CAMPO} rows={3} value={resposta} onChange={e=>setResposta(e.target.value)}/></label>
          <label className="block text-sm">Desfecho<textarea className={CAMPO} rows={3} value={desfecho} onChange={e=>setDesfecho(e.target.value)}/></label>
          <label className="block text-sm">Fundamentação<textarea className={CAMPO} rows={2} value={fundamento} onChange={e=>setFundamento(e.target.value)}/></label>
          <Button className="min-h-11" disabled={salvando||(!resposta.trim()&&!desfecho.trim())} onClick={()=>void guardar(a.id)}>{salvando?"Salvando…":"Salvar resposta/desfecho"}</Button>
        </div>}
      </div>)}
      {totalAp>PAGINA_HISTORICO&&<nav aria-label="Páginas de apontamentos" className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" className="min-h-11"
          disabled={lendoAp||paginaAp===0} onClick={()=>{setPaginaAp(p=>Math.max(0,p-PAGINA_HISTORICO));limparTratamento();}}>Anterior</Button>
        <span role="status" className="text-sm text-muted-foreground">
          Apontamentos {Math.min(paginaAp+1,totalAp)}–{Math.min(paginaAp+PAGINA_HISTORICO,totalAp)} de {totalAp}
        </span>
        <Button type="button" variant="outline" className="min-h-11"
          disabled={lendoAp||paginaAp+PAGINA_HISTORICO>=totalAp}
          onClick={()=>{setPaginaAp(p=>p+PAGINA_HISTORICO);limparTratamento();}}>Próxima</Button>
      </nav>}
    </div>}
  </div>;
}
