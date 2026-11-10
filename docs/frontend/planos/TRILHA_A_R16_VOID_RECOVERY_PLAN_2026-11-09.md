# Plano único de continuidade Trilha A: resposta void e recuperação R15

Autorização: titular nesta conversa, execução integral sem novas confirmações. V1 continua PENDENTE; PROD e types.ts imutáveis.

## Evidência e causa
Inspeção 42705850329/job129462302474 validou artefato13713326447/SHA49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262. R15 ORIGINAL é42703523206; os runs posteriores com REQUEST_PARENT são subscribers de commits documentais e não substituem o original. Report: OBSERVATION_FAILED/RPC:aprovar_parecer_interno/RESPONSE_PROJECTION, ledger12=10 confirmadas+1 reservaR11+1 incertaR15; logouttrue. Backend5eca migration20261102192345 define privado.aprovar_parecer_interno RETURNS VOID; cliente decidirParecer não exige JSON. Observador JSON.parse de corpo vazio rejeita a resposta. Não atribuir confirmação nem repetir aprovação.

## Sequência única
1. Preservar PR521 concorrente, histórico e19telas. Corrigir interpretação anterior de REQUEST_PARENT: não é causa do R15 original.
2. Teste RED consumidor createOfficialObserver com resposta204/corpo0 ao RPC exato; negativos para GET, outrosRPC,200vazio,204não-vazio e respostaHTTPfalha. GREEN apenas resposta204vazia do RPC exato; ACK não confirma negócio, readback contextual continua obrigatório.
3. Arquivos de BUILD fechados: scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs. Nenhum catálogo de dados ampliado. Rodar Node tests, lint/fmt, probes nativos aplicáveis e CI antes merge.
4. Recuperação R15 em etapa documental e testes próprios antes nova sessão: preservar recibos e report originais, consultar estado pelo UI/GET permitido; manter negação de replay da aprovação incerta. Incorporar uma segunda reserva ao orçamento, sem reembolso fictício. Definir próximo nonce somente após recuperação comprovada e BUILD/revisão/CI. Nenhum dispatch ou rerun do R15.
5. Retomar fixtures V117/V119/V120 sem duplicar negócio. Somente após bindings íntegros, auditoria8IDs V111,V114,V115,V116,V117,V118,V119,V120 nas4larguras×2temas. Preservar origens19, não confundir64combinações com184casosA.
6. Conferir PNG/DOM/SHA256, falhas e72critérios; registrar checkpoint e certificado somente após provas completas.

## Segurança e rollback
Manter endpoint exato, status, bodylimit/zeroização, causalidade, contexto, freshness, JWT/RLS, LOCK-TYPES e guards. Reverter pelo commit se regressão, sem reescrever histórico. PR521 não recebe alterações deste plano. Alterações adicionais exigem emenda concreta validada dentro desta autorização, não bypass de segurança.
