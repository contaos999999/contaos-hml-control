# Homologação HML REAL: acesso A/B, Auth, CRUD e upload — ContaOS 4.1
**Status:** PLANEJADO, NÃO EXECUTADO. Esta documentação não autoriza investigar ou alterar o Supabase.

## Antes do teste
O responsável determinou: se surgir possível lacuna backend durante o frontend, **PARAR e pedir autorização expressa antes de acessar `contaos9999/develop` ou Supabase para investigar**. Para ensaios reais com dados de teste, pedir **autorização específica** para autenticar/criar fixtures no HML e posterior limpeza. Isso não autoriza mudar código, RLS, migrations, RPCs, Auth config, Edge ou PROD.

Condições necessárias: dois usuários de teste independentes com e-mails sob controle do titular e senhas distintas; duas organizações A e B com vínculo ativo isolado por identidade, perfis comuns sem privilégio Master; um contrato fictício de cada organização; anexos não pessoais no Storage privado existente; caixa postal de teste para redefinição. No último diagnóstico registrado havia 4 organizações, **0 contratos** e **1 vínculo ativo**. Não reconsultei o backend agora, portanto não suponho que já existem os fixtures necessários.

## Plano de ensaio e evidências
| Cenário | Prova exigida |
| --- | --- |
| Login/logout | Sessão HML A e B real, expiração e tentativa de acesso depois do logout |
| Perfis, organizações e UUID | A acessa seus próprios objetos; A não acessa nem por URL/UUID a organização ou contrato B; repetir B→A |
| CRUD | Criar, ler, atualizar e versionar contratante e contrato fictícios conforme permissões oficiais, sem criar infraestrutura paralela |
| RLS e RPC | Respostas negativas registradas de forma sanitizada, com referência ao caso/usuário de teste, sem JWT |
| Upload/download | Arquivo fictício e hash conhecido em bucket já privado; download autorizado; negação cruzada A/B |
| SYS02/SYS03 | E-mail real para caixa de teste controlada; link válido, inválido e expirado; reset e login posterior sem expor URL/token |
| Duplicidade/conflito | Repetir envio e atualização obsoleta: idempotência e stale update preservados |
| Auditoria | Eventos de operações materiais, versões, histórico e exclusões de teste rastreáveis no backend |

## Como preparar sem enviar segredos ao chat
1. Após autorização formal, abrir **Supabase Dashboard HML → Authentication → Users** e criar ou escolher **somente usuários de teste autorizados**, ou utilizar fluxo administrativo canônico do ContaOS. Não usar identidade global Master para teste negativo nem inserir `service_role` no navegador.
2. Usar **a própria interface** para criar contratos/documentos fictícios e vínculos permitidos, sem mudar schema/RLS/policies/Storage/Edge para facilitar o teste.
3. Se for criado workflow E2E autenticado, manter credenciais exclusivamente em **GitHub Environment `hml-e2e` com aprovação manual**, Secrets por usuário e nunca em PR público, screenshot ou log.
4. Realizar somente as operações autorizadas, recolher screenshots com dados sensíveis removidos, evidências de autorização A/B, logs sem credenciais e referência Git SHA. Limpar fixtures pelo procedimento formal, preservando logs de auditoria.
5. Teste de recuperação de senha requer caixa de e-mail controlada, ação humana e links não registrados em evidências. Se o usuário não dispõe desse acesso, `NÃO VERIFICADO`.

**Estado dos quatro fluxos na presente alteração:** HML E2E real NÃO VERIFICADO; não foram criados usuários, contratos ou arquivos; Supabase HML e PROD não foram tocados.
