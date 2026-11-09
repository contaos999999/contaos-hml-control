# Trilha C: certificação autenticada das telas, 09/11/2026

**Resultado atual: NO-GO por sessão autenticada indisponível.** Este registro não é certificado.

## Entrega concreta desta execução

Foi realizado um único deploy consolidado em staging do commit348649f6, projeto ContaOS HML, deployment `dpl_CMfAWLLrqXEM9K1SLETaF4PQQg4S`, READY. O alias https://contaos-41-hml.vercel.app foi atualizado e seu readback confirmou o mesmo SHA. A URL /login respondeu HTTP200 e título Entrar — ContaOS. Nenhuma alteração de backend, CORS, RLS, credenciais ou produção. A primeira requisição com targetpreview foi rejeitada na validação HTTP400, sem deployment; o único pedido válido usou staging. O cancelamento automático anterior era ignored-build-step. Não houve quota402.

## Prova existente preservada e conferida

Artefato13695375147/run42659986233: ZIP38.558.278bytes, SHA256 `260fefbb9d224fcb2b3d49050642359b326feddd424d7b5f92f0b39f945f89af`, igual ao GitHub. Todos356hashes internos verificados, zero divergência;354PNG/357membros. O tested_sha764ea7a0 (merge sintético CI) tem árvoreaac14d65 idêntica ao HEAD9018 e à main348649. Resultado original:24PASSpúblicos,208protegidosSEMSESSÃO; não equivale a auditoria privada. Os gates/1222testes/revisão da PR491 e a API42596392357 não foram reexecutados.

## Cobertura canônica e pendências individuais

A denominação histórica27telas não corresponde ao inventário técnico atual:28rotas distintas e o drawerV117 totalizam29superfícies,232combinações em1440/1280/768/390 e claro/escuro. A CSV vinculada contém um resultado por combinação, capturas/hashesCI separados dos campos HML ainda vazios. Nenhuma duplicação ou login recebe PASS autenticado.

| Superfície | Caminho/contexto | Resultado autenticado atual |
| --- | --- | --- |
| SYS01 | `/login` | N/A autenticação; prova pública CI preservada |
| SYS02 | `/esqueci-senha` | N/A autenticação; prova pública CI preservada |
| SYS03 | `/redefinir-senha` | N/A autenticação; prova pública CI preservada |
| SYS04 | `/selecionar-organizacao` | PENDENTE: AUTH_REQUIRED |
| SYS05 | `/` | PENDENTE: AUTH_REQUIRED |
| ADM01 | `/administracao/usuarios` | PENDENTE: AUTH_REQUIRED |
| V101 | `/contratantes` | PENDENTE: AUTH_REQUIRED |
| V102 | `/contratantes/novo` | PENDENTE: AUTH_REQUIRED |
| V103 | `/contratantes/041ebf9f-5e32-4744-80d6-d745fa5fc483/editar` | PENDENTE: AUTH_REQUIRED |
| V104 | `/contratos` | PENDENTE: AUTH_REQUIRED |
| V105 | `/contratos/novo` | PENDENTE: AUTH_REQUIRED |
| V106 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74` | PENDENTE: AUTH_REQUIRED |
| V107 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/base-normativa` | PENDENTE: AUTH_REQUIRED |
| V108 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/orcamento` | PENDENTE: AUTH_REQUIRED |
| V109 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/regras` | PENDENTE: AUTH_REQUIRED |
| V110 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/documentos` | PENDENTE: AUTH_REQUIRED |
| V111 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/documentos/525e54fc-feec-4dc0-b540-1510a3c52485` | PENDENTE: AUTH_REQUIRED |
| V112 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/competencias` | PENDENTE: AUTH_REQUIRED |
| V113 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/competencias/nova` | PENDENTE: AUTH_REQUIRED |
| V114 | `/competencias/59072760-4420-4598-82dd-367f41a79e89` | PENDENTE: AUTH_REQUIRED |
| V115 | `/competencias/59072760-4420-4598-82dd-367f41a79e89/documentos` | PENDENTE: AUTH_REQUIRED |
| V116 | `/competencias/59072760-4420-4598-82dd-367f41a79e89/analise` | PENDENTE: AUTH_REQUIRED |
| V117 | `/competencias/:id/analise → drawer de requisito` | PENDENTE: AUTH_REQUIRED e fixture/binding |
| V118 | `/competencias/59072760-4420-4598-82dd-367f41a79e89/parecer` | PENDENTE: AUTH_REQUIRED |
| V119 | `/competencias/:id/apresentar → estado elegível` | PENDENTE: AUTH_REQUIRED e fixture/binding |
| V120 | `/competencias/:id/apresentacoes/:id → apresentação existente` | PENDENTE: AUTH_REQUIRED e fixture/binding |
| V121 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/historico` | PENDENTE: AUTH_REQUIRED |
| V122 | `/contratos/be89ef7e-d839-46c0-9cfb-4da81edf8b74/historico/importar` | PENDENTE: AUTH_REQUIRED |
| V123 | `/administracao/auditoria` | PENDENTE: AUTH_REQUIRED |

## Impedimentos comprovados

TinyFish d8293c66 retornou AUTH_REQUIRED na origem anterior; não foram inseridas credenciais nem executadas perguntas ou mutações. Browser local indisponível e browser cloud sem sessão. O perfil precisa ser salvo após login no alias atual. Não publicar o link de setup nem credenciais no GitHub.

O executor A mantém AUDIT_BINDING_PENDING e três bindings V117/V119/V120 ausentes em privateCases. O último preparo automático42661550770/job129314135815 falhou REQUEST_PARENT antes Auth/materialSKIPPED. Não reusar nonce, não alterar ou enfraquecer o guard e não declarar sucesso de auditoria porque o workflow terminou sem job material.

## Próxima etapa

Após restauração da sessão: verificar primeiro o acesso atual no alias e a identidade do produto; executar encerramento com confirmação/readback, paginação real e revalidação de fontes. Completar capturas originais, SHA256, logs e resultados individuais da matriz canônica, incluindo os estados/fixtures V117,V119,V120, e submeter as evidências à revisão independente. Repetir só casos afetados por falha/correção. Não redeployar por documentação/harness. Certificar somente com provas autenticadas aprovadas.

Arquivos: [resultado](evidencias/trilha-c-certificacao-20261109/RESULTADO_PARCIAL.json), [matriz](evidencias/trilha-c-certificacao-20261109/MATRIZ_CANONICA_232.csv), [hashes públicos](evidencias/trilha-c-certificacao-20261109/PUBLIC_CI_SHA256SUMS).
