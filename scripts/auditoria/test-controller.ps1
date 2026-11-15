param([Parameter(Mandatory=$true)][string]$Controller,[string]$ReviewCase,[string]$FixtureRoot)
$ErrorActionPreference='Stop'
$tokens=$null; $errors=$null
$ast=[System.Management.Automation.Language.Parser]::ParseFile($Controller,[ref]$tokens,[ref]$errors)
if($errors.Count){throw 'Parser invalido'}
$functions=$ast.FindAll({param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst]},$false)
foreach($f in $functions){ Invoke-Expression $f.Extent.Text }
# Run the actual Revisar tail in a child PowerShell; only GitHub and human
# input are stubbed. Every unexpected external command fails closed.
if($ReviewCase){
 $Pr=314; $Repo='contaos999999/contaos-hml-control'; $AuditRoot=$FixtureRoot
 $Head='a'*40; $RunId='20261115T000000000Z-aaaaaaaaaaaa-11111111111111111111111111111111'
 $run=New-AuditRun $FixtureRoot $Pr $Head; $RunId=Split-Path $run -Leaf
 $global:reviewPR=('{"number":314,"state":"OPEN","isDraft":false,"headRefOid":"'+$Head+'","baseRefName":"main","baseRefOid":"'+('b'*40)+'","author":{"login":"edivan5002"}}' | ConvertFrom-Json)
 $global:liveOid='b'*40; $global:login='contaos9999'; $global:bucket='pass'; $global:checkCount=0
 $global:sent=Join-Path $FixtureRoot 'sent.json'
 function gh {[IO.File]::WriteAllText((Join-Path $FixtureRoot 'unexpected.txt'),'unsafe invocation');throw 'Unexpected legacy/unsafe external GitHub invocation'}
 function GhTexto([string[]]$argsList){
  if($argsList[0] -eq 'pr' -and $argsList[1] -eq 'view'){return ($global:reviewPR | ConvertTo-Json -Depth 8 -Compress)}
  if($argsList[0] -eq 'pr' -and $argsList[1] -eq 'checks'){$global:checkCount++; return ('[{"name":"required","bucket":"'+$global:bucket+'"}]')}
  if($argsList[0] -eq 'api' -and $argsList[1] -eq 'user'){return $global:login}
  if($argsList[0] -eq 'api' -and $argsList[1] -like 'repos/*/git/ref/heads/*'){return (@{ref=('refs/heads/'+$global:reviewPR.baseRefName);object=@{type='commit';sha=$global:liveOid}} | ConvertTo-Json -Depth 8)}
  if($argsList[0] -eq 'api' -and $argsList -contains 'POST'){
   if($argsList -notcontains 'repos/contaos999999/contaos-hml-control/pulls/314/reviews'){throw 'Wrong review endpoint'}
   $i=[array]::IndexOf($argsList,'--input'); if($i -lt 0){throw 'No structured payload'}
   $payload=Get-Content -Raw -Encoding UTF8 $argsList[$i+1] | ConvertFrom-Json
   if($global:checkCount -lt 2 -and $ReviewCase -ne 'request_changes'){throw 'Required checks were not refreshed after confirmation'}
   Write-NewJson $global:sent $payload
   if($ReviewCase -eq 'post_base_change'){$global:liveOid='c'*40}
   return (@{id=88;commit_id=$payload.commit_id;state=$(if($payload.event -eq 'APPROVE'){'APPROVED'}else{'CHANGES_REQUESTED'});user=@{login='contaos9999'}} | ConvertTo-Json -Depth 8)
  }
  if($argsList[0] -eq 'api' -and $argsList[1] -eq ('repos/'+$Repo+'/pulls/314/reviews/88')){
   return (@{id=88;commit_id=$(if($ReviewCase -eq 'readback_commit'){'c'*40}else{$Head});state=$(if($ReviewCase -eq 'request_changes'){'CHANGES_REQUESTED'}else{'APPROVED'});user=@{login=$(if($ReviewCase -eq 'readback_login'){'other'}else{'contaos9999'})}} | ConvertTo-Json -Depth 8)
  }
  throw ('Unexpected offline API call: '+($argsList -join ' '))
 }
 function Read-Host([string]$Prompt){
  switch($ReviewCase){
   'cancel' {return 'CANCELAR'}
   'base_change_confirm' {$global:liveOid='c'*40}
   'head_change_confirm' {$global:reviewPR.headRefOid='c'*40}
   'name_change_confirm' {$global:reviewPR.baseRefName='other'}
   'author_change_confirm' {$global:reviewPR.author.login='other'}
   'login_change_confirm' {$global:login='other'}
   'checks_change_confirm' {$global:bucket='skipping'}
   'hash_change_confirm' {[IO.File]::AppendAllText((Join-Path $run 'parecer.md'),'tampered')}
   'request_changes' {return 'SOLICITAR'}
  }
  return 'APROVAR'
 }
 $p=InfoPR
 if($ReviewCase -match '^(prepare|analyze)_'){
  $Acao=if($ReviewCase.StartsWith('prepare_')){'Preparar'}else{'Analisar'}
  $Audit=Join-Path $FixtureRoot 'worktree'; $Fonte=$Audit; New-Item -ItemType Directory $Audit | Out-Null
  $Base=$FixtureRoot; $ModeloAuditor=''; $Profile=Join-Path $FixtureRoot 'auditor.toml'
  $Runner=Join-Path $FixtureRoot 'runner.py'; $Prepare=Join-Path $FixtureRoot 'prepare.py'
  foreach($file in @($Profile,$Runner,$Prepare)){[IO.File]::WriteAllText($file,'fixture only')}
  function Exigir([string]$programa){}
  function git.exe {
   $global:LASTEXITCODE=0
   switch(($args -join ' ')){
    'rev-parse --is-inside-work-tree' {return 'true'}
    'rev-parse HEAD' {return $Head}
    'hash-object src/integrations/supabase/types.ts' {return '8ea7750b75fd9d76b29c36ce7613392e3ab65e19'}
    'status --porcelain' {return}
   }
   if($args[0] -in @('fetch','switch')){return}
   throw ('Unexpected fixture Git invocation '+($args -join ' '))
  }
  function python {
   $global:LASTEXITCODE=0
   if($args[0] -eq $Prepare){
    $i=[array]::IndexOf($args,'--output');$out=$args[$i+1]
    Write-NewJson (Join-Path $out 'preparation.json') @{fixture=$true}
    Write-NewJson (Join-Path $out 'github-evidence.json') @{fixture=$true}
    if($ReviewCase -eq 'prepare_base_change'){$global:liveOid='c'*40}
   } elseif($args[0] -eq $Runner){
    $i=[array]::IndexOf($args,'--report');[IO.File]::WriteAllText($args[$i+1],'VEREDITO: PASS')
    if($ReviewCase -eq 'analyze_base_change'){$global:liveOid='c'*40}
    if($ReviewCase -eq 'analyze_head_change'){$global:reviewPR.headRefOid='c'*40}
   } else {throw 'Unexpected Python invocation in fixture'}
  }
  $source=Get-Content -Raw -Encoding UTF8 $Controller
  $start=$source.IndexOf("if(`$Acao -in @('Analisar','Preparar'))",[StringComparison]::Ordinal)
  $end=$source.IndexOf('# Revisar: seleciona uma execucao imutavel; nunca usa um ponteiro',[StringComparison]::Ordinal)
  if($start -lt 0 -or $end -le $start){throw 'Real preparation/analysis block missing'}
  $flowFile=Join-Path $FixtureRoot 'actual-flow.ps1'
  [IO.File]::WriteAllText($flowFile,$source.Substring($start,$end-$start),(New-Object Text.UTF8Encoding($true)))
  & $flowFile
  exit 0
 }
 $verdict=if($ReviewCase -eq 'request_changes'){'CHANGES_REQUESTED'}else{'PASS'}
 [IO.File]::WriteAllText((Join-Path $run 'parecer.md'),('VEREDITO: '+$verdict),(New-Object Text.UTF8Encoding($false)))
 $metadata=@{state='COMPLETED';repo=$Repo;pr=$Pr;head=$Head;base='main';baseHead=('b'*40);baseLiveOid=('b'*40);author='edivan5002';contextAfterPreparation=$p;contextAfterAnalysis=$p;verdict=$verdict;reportSha256=(Get-FileHash (Join-Path $run 'parecer.md')).Hash}
 switch($ReviewCase){
  'author_same' {$global:login='edivan5002'}
  'skipping' {$global:bucket='skipping'}
  'hash_mismatch' {$metadata.reportSha256='0'*64}
  'metadata_missing_live' {$metadata.Remove('baseLiveOid')}
 }
 Write-NewJson (Join-Path $run 'metadata.final.json') $metadata
 $source=Get-Content -Raw -Encoding UTF8 $Controller
 $marker='# Revisar: seleciona uma execucao imutavel; nunca usa um ponteiro'
 $start=$source.IndexOf($marker,[StringComparison]::Ordinal)
 if($start -lt 0){throw 'Real Revisar tail not found'}
 & ([scriptblock]::Create($source.Substring($start)))
 exit 0
}
$failed=0; $passed=0
function Case([string]$name,[scriptblock]$test){try{ & $test; $script:passed++; Write-Output "PASS $name" }catch{$script:failed++; Write-Output "FAIL $name : $_"}}
function MustThrow([scriptblock]$test){$threw=$false;try{ & $test }catch{$threw=$true};if(-not $threw){throw 'Esperava rejeicao'}}
Case 'gate NR-004 rejeita skipping no predicado real' {
 $source=Get-Content -Raw $Controller
 $match=[regex]::Match($source,'Where-Object\s*\{\s*\$_\.bucket[^}]+\}')
 if(-not $match.Success){throw 'Predicado ausente'}
 $items=@([pscustomobject]@{name='Teste C';bucket='skipping'})
 $bad=@(& ([scriptblock]::Create('$items | '+$match.Value)))
 if($bad.Count -ne 1){throw 'skipping foi aceito'}
}
Case 'wrapper Git chama executavel nativo sem recursao' {
 $actual=Get-Command git -ErrorAction Stop
 if($actual.CommandType -eq 'Function'){throw 'git resolve para funcao recursiva'}
 $version=Invoke-AuditGit -argsList @('--version')
 if(($version | Out-String) -notmatch 'git version'){throw 'Git nativo nao executou'}
}
foreach($requiredFunction in @('Assert-RequiredChecks','New-AuditRun','Write-NewJson','Get-AuditRun')){
 Case "funcao $requiredFunction existe" {if(-not (Get-Command $requiredFunction -CommandType Function -ErrorAction SilentlyContinue)){throw 'Funcao ausente'}}
}
foreach($bucket in @('skipping','fail','pending','cancel','unknown','')){
  Case "rejeita bucket $bucket" { MustThrow { Assert-RequiredChecks @([pscustomobject]@{name='C';bucket=$bucket}) } }
}
Case 'rejeita checks vazios' { MustThrow { Assert-RequiredChecks @() } }
Case 'aceita somente pass' { Assert-RequiredChecks @([pscustomobject]@{name='C';bucket='pass'}) }
Case 'rejeita mistura pass e skipping' { MustThrow { Assert-RequiredChecks @([pscustomobject]@{name='A';bucket='pass'},[pscustomobject]@{name='B';bucket='skipping'}) } }
$root=Join-Path $env:TEMP ('audit-tests-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $root | Out-Null
Case 'duas execucoes preservam metadados anteriores' {
 $one=New-AuditRun $root 679 ('a'*40)
 Write-NewJson (Join-Path $one 'metadata.initial.json') @{state='IN_PROGRESS'}
 $hash=(Get-FileHash (Join-Path $one 'metadata.initial.json')).Hash
 $two=New-AuditRun $root 679 ('a'*40)
 if($one -eq $two){throw 'Mesmo caminho'}
 if((Get-FileHash (Join-Path $one 'metadata.initial.json')).Hash -ne $hash){throw 'Evidencia alterada'}
}
Case 'CreateNew rejeita sobrescrita e preserva bytes' {
 $p=Join-Path $root 'immutable.json'; Write-NewJson $p @{value=1}; $hash=(Get-FileHash $p).Hash
 MustThrow {Write-NewJson $p @{value=2}}
 if((Get-FileHash $p).Hash -ne $hash){throw 'Sobrescrito'}
}
Case 'RunId rejeita traversal' { MustThrow {Get-AuditRun $root 679 '../fora'} }
Case 'RunId explicito resolve somente execucao existente' {
 $run=New-AuditRun $root 679 ('b'*40); $id=Split-Path $run -Leaf
 if((Get-AuditRun $root 679 $id) -ne $run){throw 'Selecao incorreta'}
}
# External GitHub boundary only: InfoPR and context validation remain real.
$Pr=314; $Repo='contaos999999/contaos-hml-control'
function FixturePR {
 return ('{"number":314,"state":"OPEN","isDraft":false,"url":"https://example.invalid/314","headRefOid":"'+('a'*40)+'","baseRefName":"main","baseRefOid":"'+('b'*40)+'","author":{"login":"edivan5002"}}' | ConvertFrom-Json)
}
function Reset-Remote {
 $script:remotePR=FixturePR
 $script:remoteRef=[pscustomobject]@{ref='refs/heads/main';object=[pscustomobject]@{type='commit';sha=('b'*40)}}
 $script:remoteError=$false; $script:rawRef=$null; $script:apiCalls=New-Object Collections.Generic.List[string]
}
function GhTexto([string[]]$argsList) {
 $script:apiCalls.Add(($argsList -join ' '))
 if($argsList[0] -eq 'pr' -and $argsList[1] -eq 'view'){return ($script:remotePR | ConvertTo-Json -Depth 8 -Compress)}
 if($argsList[0] -eq 'api' -and $argsList[1] -like 'repos/*/git/ref/heads/*'){
  if($script:remoteError){throw 'fixture HTTP404'}
  if($script:rawRef){return $script:rawRef}
  return (ConvertTo-Json -InputObject $script:remoteRef -Depth 8 -Compress)
 }
 throw 'Unexpected external call in offline context test'
}
Case 'base viva stale inicial bloqueia InfoPR real' {
 Reset-Remote; $script:remoteRef.object.sha='c'*40
 MustThrow {InfoPR}
}
Case 'base viva estavel preserva ambos OIDs e consulta autenticada' {
 Reset-Remote; $actual=InfoPR
 if($actual.baseRefOid -cne ('b'*40) -or $actual.baseLiveOid -cne ('b'*40)){throw 'OID/proveniencia ausente'}
 if($actual.baseRef -cne 'refs/heads/main' -or -not $actual.baseRefCheckedAt){throw 'Proveniencia da ref ausente'}
 if(-not $script:apiCalls.Contains('api repos/contaos999999/contaos-hml-control/git/ref/heads/main')){throw 'Sem consulta da ref viva'}
}
foreach($bad in @('missing','list','sha','type','name','error','json')) {
 Case "base viva rejeita resposta $bad" {
  Reset-Remote
  switch($bad){
   'missing' {$script:remoteRef=$null}
   'list' {$script:remoteRef=@($script:remoteRef,$script:remoteRef)}
   'sha' {$script:remoteRef.object.sha='invalid'}
   'type' {$script:remoteRef.object.type='tag'}
   'name' {$script:remoteRef.ref='refs/heads/other'}
   'error' {$script:remoteError=$true}
   'json' {$script:rawRef='{invalid JSON'}
  }
  MustThrow {InfoPR}
 }
}
Case 'base com barra escapa endpoint sem trocar nome da ref' {
 Reset-Remote; $script:remotePR.baseRefName='release/v1'; $script:remoteRef.ref='refs/heads/release/v1'
 $actual=InfoPR
 if($actual.baseRefName -cne 'release/v1' -or -not $script:apiCalls.Contains('api repos/contaos999999/contaos-hml-control/git/ref/heads/release%2Fv1')){throw 'Nome/endpoint divergente'}
}
foreach($field in @('number','headRefOid','baseRefName','baseRefOid','baseLiveOid','author')) {
 Case "contexto rejeita mudanca de $field" {
  Reset-Remote; $before=InfoPR; $after=($before | ConvertTo-Json -Depth 8 | ConvertFrom-Json)
  switch($field){
   'number' {$after.number=999}
   'author' {$after.author.login='other'}
   default {$after.$field='c'*40}
  }
  MustThrow {Assert-AuditContext $before $after}
 }
}
Case 'contexto estavel apos preparacao e analise e aceito' {
 Reset-Remote; $before=InfoPR
 Assert-AuditContext $before (InfoPR)
 Assert-AuditContext $before (InfoPR)
}
Case 'contexto nao aceita nome diferente com OID igual' {
 Reset-Remote; $before=InfoPR
 $script:remotePR.baseRefName='other'; $script:remoteRef.ref='refs/heads/other'
 MustThrow {Assert-AuditContext $before (InfoPR)}
}
$testScript=$MyInvocation.MyCommand.Path
foreach($scenario in @('stable','request_changes','cancel','skipping','author_same','hash_mismatch','metadata_missing_live','base_change_confirm','head_change_confirm','name_change_confirm','author_change_confirm','login_change_confirm','checks_change_confirm','hash_change_confirm','readback_commit','readback_login','post_base_change','prepare_stable','prepare_base_change','analyze_stable','analyze_base_change','analyze_head_change')){
 Case "Revisar real offline $scenario" {
  $fixture=Join-Path $root $scenario; New-Item -ItemType Directory $fixture | Out-Null
  $prior=$ErrorActionPreference
  try {
   $ErrorActionPreference='Continue'
   & powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File $testScript -Controller ([IO.Path]::GetFullPath($Controller)) -ReviewCase $scenario -FixtureRoot $fixture *> (Join-Path $fixture 'child.log')
   $childExit=$LASTEXITCODE
  } finally {$ErrorActionPreference=$prior}
  $sent=Join-Path $fixture 'sent.json'
  if(Test-Path (Join-Path $fixture 'unexpected.txt')){throw 'Unsafe external invocation reached'}
  $shouldSend=$scenario -in @('stable','request_changes','readback_commit','readback_login','post_base_change')
  $shouldSucceed=$scenario -in @('stable','request_changes','cancel','prepare_stable','analyze_stable')
  if(($childExit -eq 0) -ne $shouldSucceed){throw "Unexpected exit $childExit; see $fixture/child.log"}
  if((Test-Path $sent) -ne $shouldSend){throw 'Unexpected review side effect'}
  if($scenario -match '^(prepare|analyze)_'){
   $finals=@(Get-ChildItem $fixture -Filter metadata.final.json -Recurse)
   $failures=@(Get-ChildItem $fixture -Filter failure.json -Recurse)
   if($shouldSucceed){
    if($finals.Count -ne 1 -or $failures.Count){throw 'Missing/invalid completed evidence'}
    $final=Get-Content -Raw $finals[0].FullName | ConvertFrom-Json
    $want=if($scenario -eq 'prepare_stable'){'PREPARED'}else{'COMPLETED'}
    if($final.state -cne $want -or $final.contextAfterPreparation.baseLiveOid -cne ('b'*40)){throw 'Context/state not preserved'}
   } else {
    if($finals.Count -or $failures.Count -ne 1){throw 'Changed context did not preserve failure and block final metadata'}
    $failure=Get-Content -Raw $failures[0].FullName | ConvertFrom-Json
    if($failure.error -notmatch 'Base gravada|Contexto mudou'){throw 'Failure did not come from context guard'}
   }
  }
  if($shouldSend){
   $payload=Get-Content -Raw $sent | ConvertFrom-Json
   $event=if($scenario -eq 'request_changes'){'REQUEST_CHANGES'}else{'APPROVE'}
   if($payload.commit_id -cne ('a'*40) -or $payload.event -cne $event){throw 'Review not anchored to expected SHA/event'}
  }
 }
}
Write-Output "RESULTADO: $passed PASS; $failed FAIL"
if($failed){exit 1}
