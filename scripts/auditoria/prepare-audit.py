"""Trusted preparation outside the read-only auditor; no tokens are exported."""
import argparse,base64,datetime,hashlib,importlib.util,json,os,pathlib,re,shutil,subprocess

BUN_VERSION='1.4.4'
NODE_VERSION='24.22.3'
FROZEN_INSTALL_ARGS=('install','--frozen-lockfile','--ignore-scripts')
CANONICAL_FILES=(
 'docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv',
 'docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json',
 'docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json',
 '.github/workflows/contaos-trilha-a-fixtures.yml')
REPO='contaos999999/contaos-hml-control'
LOCKED='8ea7750b75fd9d76b29c36ce7613392e3ab65e19'
TOOL_PINS={
 'bun':{'name':'@oven/bun-windows-x64','version':BUN_VERSION,'url':'https://registry.npmjs.org/@oven/bun-windows-x64/-/bun-windows-x64-1.4.4.tgz','integrity':'sha512-a3LNctBVO8PjePsFZfwDleF2JXYf2BfQ1u/PLRnBDLnC2Riml+4+LgJpKj4xRGhB92KweGyQI5PXaTkP9qypMQ==','sha256':'cb1d8e6564e655e49d30cead359750a1cbbd12f42651caa4b62244d7bd93c244','binary':'bin/bun.exe'},
 'node':{'name':'node-win-x64','version':NODE_VERSION,'url':'https://registry.npmjs.org/node-win-x64/-/node-win-x64-24.22.3.tgz','integrity':'sha512-aqVwIzdna4CA6EcE1gE9waFVuXn4zbRtKjI9BbXvw0vXxHV3Fbs4TKIP5dK3nwmifhfZMarisx+qNWgGYouaMA==','sha256':'86fc4785327db5f5c7558dc6156c543b433c313e813a222e088086222ab4afa6','binary':'bin/node.exe'}}

def digest(data):return hashlib.sha256(data).hexdigest()
def preparation_environment(source=None):
 spec=importlib.util.spec_from_file_location('contaos_audit_runner_env',pathlib.Path(__file__).with_name('auditor-runner.py'))
 runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
 return runner.audit_environment(source)
def tool_specs():
 deps={p['name']:p['version'] for p in TOOL_PINS.values()}
 package={'name':'contaos-audit-binaries','version':'1.0.0','private':True,'dependencies':deps}
 lock={'name':package['name'],'version':package['version'],'lockfileVersion':3,'requires':True,'packages':{'':{'name':package['name'],'version':package['version'],'dependencies':deps}}}
 for p in TOOL_PINS.values():lock['packages']['node_modules/'+p['name']]={'version':p['version'],'resolved':p['url'],'integrity':p['integrity']}
 return package,lock
def bootstrap_command(tools):
 return ['npm.cmd','ci','--prefix',str(tools),'--ignore-scripts','--no-audit','--no-fund','--registry','https://registry.npmjs.org','--userconfig',str(tools/'npm-user-empty.npmrc'),'--globalconfig',str(tools/'npm-global-empty.npmrc'),'--cache',str(tools/'npm-cache')]
def binary_matches(path,sha):
 return path.is_file() and not path.is_symlink() and digest(path.read_bytes())==sha
def write_new_json(path,value):
 with pathlib.Path(path).open('x',encoding='utf-8') as f:json.dump(value,f,ensure_ascii=False,indent=2)
def canonical_bytes(working,blob):
 if working!=blob and working.replace(b'\r\n',b'\n')!=blob:raise ValueError('Material difference; refusing canonical checkout')
 return blob
def materialize_canonical(repo,names,git):
 git('diff','--cached','--exit-code')
 records=[];pending=[]
 # Validate the whole set before writing even the first EOL-only change.
 for name in names:
  working=(repo/name).read_bytes();blob=git('show','HEAD:'+name);canonical_bytes(working,blob)
  records.append({'path':name,'sha256':digest(blob),'eolRestored':working!=blob})
  if working!=blob:pending.append((name,blob))
 for name,blob in pending:(repo/name).write_bytes(blob)
 if pending:
  # Refresh CRLF/index metadata without changing any staged blob.
  git('add','--renormalize','--',*(name for name,blob in pending))
  git('diff','--cached','--exit-code')
 return records
def validate_pr(pr,head,base):
 if pr.get('state')!='OPEN' or pr.get('isDraft') or pr.get('headRefOid')!=head or pr.get('baseRefOid')!=base:
  raise ValueError('PR changed or is not eligible')
def validate_checks(checks,head):
 if checks.get('total_count')!=len(checks.get('check_runs',[])) or any(c.get('head_sha')!=head for c in checks.get('check_runs',[])):
  raise ValueError('Check snapshot incomplete or belongs to another SHA')
def actions_job(check):
 match=re.fullmatch(r'https://github\.com/'+re.escape(REPO)+r'/actions/runs/([1-9]\d*)/job/([1-9]\d*)(?:\?[^#]*)?',check.get('details_url') or '')
 if not match:raise ValueError('Actions job URL outside expected repository')
 return int(match[1]),int(match[2])

def main():
 ap=argparse.ArgumentParser()
 for name in ('repo','output','head','base','pr'):ap.add_argument('--'+name,required=True)
 a=ap.parse_args();repo=pathlib.Path(a.repo).resolve();out=pathlib.Path(a.output).resolve()
 expected=pathlib.Path.home()/'Projetos/ContaOS-4.1'
 if repo!=expected/'contaos-auditoria' or not out.is_relative_to(expected/'auditorias'):
  raise ValueError('Preparation paths outside declared audit scope')
 gh=shutil.which('gh.exe') or 'C:/Program Files/GitHub CLI/gh.exe'
 safe_env=preparation_environment()
 def command(args):return subprocess.check_output(args,cwd=repo,env=safe_env)
 def git(*args):return command(['git','-C',str(repo),*args])
 def api(path):return json.loads(command([gh,'api',path]))
 def pr_info():return json.loads(command([gh,'pr','view',str(int(a.pr)),'--repo',REPO,'--json','number,url,state,isDraft,headRefOid,baseRefOid,author,baseRefName']))
 if git('status','--porcelain=v1').strip() or git('rev-parse','HEAD').decode().strip()!=a.head:raise ValueError('Audit worktree is dirty or has another HEAD')
 if git('hash-object','src/integrations/supabase/types.ts').decode().strip()!=LOCKED:raise ValueError('LOCK-TYPES-01 drift')
 original_types=(repo/'src/integrations/supabase/types.ts').read_bytes()
 pr=pr_info();validate_pr(pr,a.head,a.base)
 evidence={'schema':'contaos.audit.preparation.v1','head':a.head,'base':a.base,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonicalCheckout':[]}
 evidence['canonicalCheckout']=materialize_canonical(repo,CANONICAL_FILES,git)
 tools=expected/'tools/auditoria/binaries-v1'
 package,tool_lock=tool_specs();tools.mkdir(parents=True,exist_ok=True)
 for name,value in [('package.json',package),('package-lock.json',tool_lock)]:
  target=tools/name
  if target.exists():
   if json.loads(target.read_text(encoding='utf-8-sig'))!=value:raise ValueError('Tool manifest/lock differs from pinned specification')
  else:write_new_json(target,value)
 for name in ['npm-user-empty.npmrc','npm-global-empty.npmrc']:
  target=tools/name
  if target.exists():
   if target.read_bytes()!=b'':raise ValueError('Bootstrap config is not empty')
  else:
   with target.open('xb'):pass
 node=tools/'node_modules/node-win-x64/bin/node.exe';bun=tools/'node_modules/@oven/bun-windows-x64/bin/bun.exe'
 def versions_ok():
  return binary_matches(node,TOOL_PINS['node']['sha256']) and binary_matches(bun,TOOL_PINS['bun']['sha256']) and command([str(node),'--version']).decode().strip()=='v'+NODE_VERSION and command([str(bun),'--version']).decode().strip()==BUN_VERSION
 if not versions_ok():
  with (out/'tools-install.log').open('xb') as log:
   subprocess.run(bootstrap_command(tools),cwd=tools,env=safe_env,stdout=log,stderr=subprocess.STDOUT,check=True)
 if not versions_ok():raise ValueError('Pinned tool versions not installed')
 if json.loads((tools/'package-lock.json').read_text(encoding='utf8'))!=tool_lock:raise ValueError('Tool lock changed during bootstrap')
 env=dict(safe_env);env['PATH']=str(node.parent)+';'+str(bun.parent)+';'+env['PATH'];env['BUN_INSTALL_CACHE_DIR']=str(tools/'bun-cache')
 lock_before=(repo/'bun.lock').read_bytes();package_before=(repo/'package.json').read_bytes()
 with (out/'dependencies-install.log').open('xb') as log:
  subprocess.run([str(bun),*FROZEN_INSTALL_ARGS],cwd=repo,env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
 if (repo/'bun.lock').read_bytes()!=lock_before or (repo/'package.json').read_bytes()!=package_before:raise ValueError('Dependency manifest changed')
 subprocess.run([str(node),'-e',"require.resolve('typescript');require.resolve('vitest')"],cwd=repo,env=env,check=True,capture_output=True)
 evidence.update({'node':NODE_VERSION,'bun':BUN_VERSION,'packageSha256':digest(package_before),'lockSha256':digest(lock_before),'tools':str(tools),'toolLockSha256':digest((tools/'package-lock.json').read_bytes()),'toolPins':TOOL_PINS,'bootstrapPolicy':'npm-ci-ignore-scripts-pinned-SRI-binaries-minimal-env-empty-user-global-config'})
 checks=api('repos/'+REPO+'/commits/'+a.head+'/check-runs?per_page=100');validate_checks(checks,a.head)
 remote={'schema':'contaos.audit.github-evidence.v1','pr':pr,'actor':api('user')['login'],'collectedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'jobs':[],'artifacts':{},'ruleset':api('repos/'+REPO+'/rulesets/26495643'),'reviews':api('repos/'+REPO+'/pulls/'+str(int(a.pr))+'/reviews?per_page=100')}
 runs=set()
 for check in checks['check_runs']:
  # Check Run IDs and Actions Job IDs are distinct resources.
  url=check.get('details_url') or ''
  if '/actions/runs/' not in url:continue
  run_id,job_id=actions_job(check)
  job=api('repos/'+REPO+'/actions/jobs/'+str(job_id));remote['jobs'].append(job)
  if job.get('head_sha')!=a.head or job.get('run_id')!=run_id or job.get('id')!=job_id:raise ValueError('Job identity or SHA differs from check URL')
  runs.add(job['run_id'])
  if check.get('conclusion')=='failure' or 'protocolo e Chromium' in check['name']:
   content=command([gh,'run','view',str(job['run_id']),'--repo',REPO,'--job',str(job['id']),'--log'])
   name='github-job-'+str(job['id'])+'.log'
   with (out/name).open('xb') as f:f.write(content)
   job['localLog']={'file':name,'sha256':digest(content)}
 for run in sorted(runs):remote['artifacts'][str(run)]=api('repos/'+REPO+'/actions/runs/'+str(run)+'/artifacts?per_page=100')
 snapshot=json.loads((repo/'docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json').read_text(encoding='utf-8-sig'))
 source=api('repos/contaos999999/develop/commits/HEAD')['sha']
 if source!=snapshot['source_commit']:raise ValueError('Canonical source changed')
 context=out/'canonical-context';context.mkdir(exist_ok=False)
 cached=pathlib.Path('C:/Users/ediva/AppData/Local/Temp/contaos-canonical-1504af465b45')
 remote['canonicalSource']={'commit':source,'documents':[]}
 for item in snapshot['context_documents']:
  name=pathlib.Path(item['path']).name;cache=cached/name
  data=cache.read_bytes() if cache.is_file() else base64.b64decode(api('repos/contaos999999/develop/git/blobs/'+item['blob_sha'])['content'])
  if hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()!=item['blob_sha']:raise ValueError('Canonical blob mismatch')
  with (context/name).open('xb') as f:f.write(data)
  remote['canonicalSource']['documents'].append({'path':'canonical-context/'+name,'blob':item['blob_sha'],'sha256':digest(data)})
 validate_pr(pr_info(),a.head,a.base)
 if git('status','--porcelain=v1').strip() or (repo/'src/integrations/supabase/types.ts').read_bytes()!=original_types:raise ValueError('Tracked source changed during preparation')
 write_new_json(out/'github-evidence.json',remote)
 evidence['githubEvidenceSha256']=digest((out/'github-evidence.json').read_bytes())
 evidence['clean']=True;evidence['typesBlob']=LOCKED
 write_new_json(out/'preparation.json',evidence)
 print('PREPARED: Node '+NODE_VERSION+', Bun '+BUN_VERSION+', frozen dependencies, canonical bytes and authenticated GitHub snapshot')

if __name__=='__main__':main()
