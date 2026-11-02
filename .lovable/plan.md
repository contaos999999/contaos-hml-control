# PROMPT 20 / SYS-05 Dashboard — Auditoria do portão: LACUNA DE BACKEND

## Conclusão

**LACUNA DE BACKEND.** A rota `/` (SYS-05) não deve ser implementada até existir, autorizado no HML, um backend de resumo executivo/operacional. O plano para aqui. Nenhum arquivo será alterado.

## Rastreabilidade

- Prompt regular: PROMPT 20.
- Prompt atômico: nenhum aplicável em 001–096 (verificação do Caderno informada pelo contratante). Não há associação artificial.

## Evidência (consulta somente leitura ao HML `gklhhhyosgasnyoxlrui`)

- Views e materialized views em `public`/`privado`: existe apenas `public.v_central_excecoes_financeiras`, que é específica de exceções financeiras e não é um resumo geral.
- Funções cujo nome contém dashboard, resumo, painel, indicador, kpi, visao, sumario, metrica ou saude: apenas `public.obter_saude_operacional`, `privado.obter_saude_operacional` e `privado.verificar_saude_operacional`.
- `obter_saude_operacional` retorna saúde técnica (jobs_24h, dlq_24h, storage, alertas_operacionais_abertos, cron) e é restrita a administrador/auditor. Ela não cobre o que o Master Design exige do Dashboard: ação agora, bloqueios, prazos, risco/não conformidade, contratos/competências e tendências. Por isso não é usada como substituto.

## Caminhos descartados (proibidos pelas regras)

- Agregar tabelas brutas (contratos, competências, não conformidades etc.) no React: seria calcular status crítico localmente.
- Usar `obter_saude_operacional` como dashboard: mudaria o propósito e excluiria os demais perfis.
- Criar view, RPC ou Edge Function por conta própria: não autorizado neste prompt.

## O que destrava o SYS-05 (decisão externa, fora deste escopo)

Uma tarefa de backend específica e autorizada no HML que entregue um contrato de resumo, por exemplo uma RPC `obter_resumo_dashboard(p_id_organizacao)` com RLS/perfil, com campos e status já calculados pelo backend para os blocos do Master Design. Depois disso, um novo PLAN do SYS-05 consome esse contrato.

## Impacto atual

- O SYS-04 continua navegando para `/`, que segue como placeholder. A DEPENDÊNCIA DE FRONTEND permanece registrada.
- Nenhum arquivo, backend, Auth ou rota foi alterado.
