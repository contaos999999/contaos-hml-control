param([Parameter(Mandatory=$true)][string]$Controller)
$ErrorActionPreference='Stop'
$tokens=$null; $errors=$null
$ast=[System.Management.Automation.Language.Parser]::ParseFile($Controller,[ref]$tokens,[ref]$errors)
if($errors.Count){throw 'Parser invalido'}
$functions=$ast.FindAll({param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst]},$false)
foreach($f in $functions){ Invoke-Expression $f.Extent.Text }
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
Write-Output "RESULTADO: $passed PASS; $failed FAIL"
if($failed){exit 1}
