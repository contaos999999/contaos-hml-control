import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
const ref = 'gklhhhyosgasnyoxlrui';
const url = `https://${ref}.supabase.co`;
const source = readFileSync('src/integrations/supabase/client.ts','utf8');
if (!source.includes(url)) throw new Error('HML_PROJECT_REF_MISMATCH');
const match = source.match(/SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/);
if (!match) throw new Error('PUBLISHABLE_KEY_MISSING');
const publishableKey = match[1];
const missing = randomUUID();
const inputs = [
['adicionar_versao_documento_competencia_v115',{p_id_documento:missing,p_id_arquivo:missing,p_motivo:'teste-sintetico',p_chave_idempotencia:randomUUID()}],
['criar_documento_competencia_v115',{p_id_competencia:missing,p_tipo:'teste-sintetico',p_titulo:'teste-sintetico',p_categoria:'teste-sintetico',p_id_requisito:missing,p_id_arquivo:missing,p_chave_idempotencia:randomUUID()}],
['enfileirar_ingestao_historica_hml',{p_id_relatorio:missing,p_id_versao_documento:missing}],
['obter_analise_competencia_v116',{p_id_competencia:missing}],
['obter_detalhe_requisito_v117',{p_id_competencia:missing,p_id_requisito:missing}],
['obter_documentos_competencia_v115',{p_id_competencia:missing}],
['obter_visao_geral_competencia',{p_id_competencia:missing}],
['registrar_relatorio_historico_hml',{p_id_arquivo:missing,p_competencia:'2026-11-01',p_tipo:'teste-sintetico'}],
['vincular_tratamento_historico_hml',{p_id_apontamento:missing,p_resposta:'teste-sintetico',p_desfecho:'teste-sintetico',p_fundamento:'teste-sintetico'}],
];
const report={project_ref:ref,scope:'HML_SYNTHETIC_ONLY',mode:'REAL_SUPABASE_REST_AUTH',anon:[],jwt:[],identity:'NOT_CONFIGURED',revocation:'NOT_TESTED',r03:'NOT_TESTED_BY_OWNER_EXCEPTION'};
const output=process.env.RUNNER_TEMP ? process.env.RUNNER_TEMP+'/p0-v1-jwt-hml.json':'/tmp/p0-v1-jwt-hml.json';
function persist(){writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
async function rpc(name,payload,token){
  const headers={'apikey':publishableKey,'Content-Type':'application/json','Accept':'application/json'};
  if(token) headers.Authorization='Bearer '+token;
  const res=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
  const data=await res.json().catch(()=>({}));
  return {name,http:res.status,pgcode:(typeof data?.code==='string' && /^[A-Z0-9]{5}$/.test(data.code))?data.code:null};
}
async function main(){
  for(const [name,payload] of inputs){
    const o=await rpc(name,payload,null);report.anon.push(o);
    if(![401,403,404].includes(o.http)) throw new Error('ANON_RPC_UNEXPECTED_HTTP_'+name+'_'+o.http);
  }
  console.log('HML_ANON_HTTP: 9/9 denied or hidden via real REST; no JWT claimed.');
  const key=process.env.CONTAOS_HML_SERVICE_ROLE_KEY||'';
  const testEmail=process.env.CONTAOS_HML_TEST_EMAIL||'';
  const testPassword=process.env.CONTAOS_HML_TEST_PASSWORD||'';
  if(!key && !(testEmail && testPassword)){
    report.identity='BLOCKED_MISSING_HML_TEST_CREDS';
    persist();
    console.error('::error::Configurar no environment hml CONTAOS_HML_SERVICE_ROLE_KEY ou CONTAOS_HML_TEST_EMAIL + CONTAOS_HML_TEST_PASSWORD; nenhuma credencial deve ser enviada pelo chat.');
    process.exitCode=2;return;
  }
  const publicClient=createClient(url,publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
  let admin=null,createdId=null,accessToken=null;
  try{
    let email=testEmail,password=testPassword;
    if(!email){
      admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
      email='contaos-ci-'+randomUUID()+'@example.invalid';
      password=randomBytes(32).toString('base64url')+'Aa1!';
      const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{synthetic:true,scope:'P0-V1-HML'}});
      if(error || !data?.user?.id)throw new Error('HML_ADMIN_CREATE_TEST_ACCOUNT_FAILED');
      createdId=data.user.id;
    }
    const login=await publicClient.auth.signInWithPassword({email,password});
    if(login.error || !login.data?.session?.access_token)throw new Error('HML_AUTH_REAL_SIGNIN_FAILED');
    accessToken=login.data.session.access_token;
    const check=await publicClient.auth.getUser(accessToken);
    if(check.error || !check.data?.user?.id)throw new Error('HML_AUTH_GET_USER_FAILED');
    report.identity='PASS_REAL_JWT_ISSUED_BY_AUTH';
    for(const [name,payload] of inputs){
      const o=await rpc(name,payload,accessToken);report.jwt.push(o);
      if(o.http>=500) throw new Error('HML_JWT_RPC_SERVER_ERROR_'+name);
    }
    console.log('HML_JWT: 9 real authenticated HTTP requests; invalid UUID fixture, no authorization-positive claims.');
    if(createdId){
      const del=await admin.auth.admin.deleteUser(createdId);
      if(del.error)throw new Error('HML_TEST_ACCOUNT_CLEANUP_FAILED');
      createdId=null;
      const revoked=await publicClient.auth.getUser(accessToken);
      report.revocation=revoked.error?'PASS_AUTH_SERVICE_NO_USER_AFTER_DELETE':'NOT_REVOKED_UNTIL_EXPIRATION';
    } else {report.revocation='NOT_TESTED_SHARED_TEST_ACCOUNT';}
  }finally{
    if(createdId && admin){
      const del=await admin.auth.admin.deleteUser(createdId);
      if(del.error)report.cleanup='FAILED_NEEDS_MANUAL_INSPECTION';
      else report.cleanup='PASS';
    }
    persist();
  }
}
main().catch(e=>{report.failure=String(e.message).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,100);persist();console.error('::error::HML_AUTH_PROBE_FAILED_'+report.failure);process.exitCode=1;});
