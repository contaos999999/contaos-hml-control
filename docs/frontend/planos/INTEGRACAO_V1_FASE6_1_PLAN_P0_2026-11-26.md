# PLAN P0 IFV1 F6.1 — jornadas de contexto

Base: PLAN #796 integrado aeea34917607a39f1903dfaa842687fec6660359. Matriz protegida blob bb7ce43f9c334f2f03e9aafab405addadfe5e19a. Contrato RBAC backend lido em main, blob c02f209c5139ac6c132ed153b39de440d62e24e5; fixar SHA normativo antes da execução. 138 IDs únicos, 120 obrigatórios/18 condicionais. Distribuição proposta por origem, sem excluir interações transversais F6.7: {"F6.1":54,"F6.2":24,"F6.3":17,"F6.4":14,"F6.5":19,"F6.6":10}.

F6.1: 54 casos, mínimo 108 provas novas. Usar adaptadores reais, fixtures com estado mutável, executar produtor e consumidor na mesma jornada; conferir transição, contexto, cache, persistência, rejeição e recuperação. Não copiar provas F5 nem simular sucesso. Testar sessão, logout, troca de organização e concorrência conforme contrato. F6.7 cobre interações adicionais. CI cumulativo no fechamento. LIVE NOT_RUN, PROD NO_GO.

Caminhos propostos para BUILD F6.1 (somente após merge deste PLAN e validação RCA):
- docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json
- docs/frontend/auditorias/integracao-funcional-v1/fase6/F6_JOURNEY_MATRIX.json
- src/test/f6-code-context-journeys.test.tsx
- src/test/f6-code-adm01-journeys.test.tsx
- src/test/f6-code-sys04-journeys.test.ts
- scripts/hml/f6-code-material-evidence.mjs
- scripts/hml/f6-code-material-evidence.test.mjs
- .github/workflows/contaos-f6-code-material.yml

Nenhuma alteração de produto autorizada por este PLAN; defeito causal exige emenda com caminhos exatos. Revisão assistida autorizada especificamente, CI, merge protegido e readback antes do BUILD.

## Reconciliação cadastral completa (proposta de fatias)

| ID | Origem | Destino | Classe | Fatia | Produtor | Consumidor |
|---|---|---|---|---|---|---|
| IFV1-F6-C0002 | ADM01 | SYS04 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | listar_organizacoes_disponiveis |
| IFV1-F6-C0005 | ADM01 | SYS05 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | obter_resumo_dashboard |
| IFV1-F6-C0007 | ADM01 | V101 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0009 | ADM01 | V102 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0011 | ADM01 | V103 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0012 | ADM01 | V104 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0014 | ADM01 | V105 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0016 | ADM01 | V106 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0017 | ADM01 | V107 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0018 | ADM01 | V108 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0019 | ADM01 | V109 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0020 | ADM01 | V110 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0021 | ADM01 | V111 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0022 | ADM01 | V112 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0023 | ADM01 | V113 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0024 | ADM01 | V114 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0025 | ADM01 | V115 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0026 | ADM01 | V116 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0027 | ADM01 | V117 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0028 | ADM01 | V118 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0029 | ADM01 | V119 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0030 | ADM01 | V120 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0031 | ADM01 | V121 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0032 | ADM01 | V122 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0033 | ADM01 | V123 | CONDICIONAL | F6.1 | salvar_vinculo_usuario_adm | eventos_auditoria |
| IFV1-F6-C0034 | ADM01 | V123 | OBRIGATORIA | F6.1 | salvar_vinculo_usuario_adm | consultar_permissoes_efetivas (infraestrutura compartilhada) |
| IFV1-F6-C0036 | SYS01 | SYS04 | OBRIGATORIA | F6.1 | listar_organizacoes_disponiveis | listar_organizacoes_disponiveis |
| IFV1-F6-C0037 | SYS01 | SYS05 | OBRIGATORIA | F6.1 | listar_organizacoes_disponiveis | obter_resumo_dashboard |
| IFV1-F6-C0041 | SYS04 | ADM01 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | consultar_permissoes_efetivas |
| IFV1-F6-C0043 | SYS04 | SYS05 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_resumo_dashboard |
| IFV1-F6-C0045 | SYS04 | V101 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratantes |
| IFV1-F6-C0046 | SYS04 | V102 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratantes |
| IFV1-F6-C0047 | SYS04 | V103 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratantes |
| IFV1-F6-C0048 | SYS04 | V104 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratos |
| IFV1-F6-C0049 | SYS04 | V105 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratantes |
| IFV1-F6-C0050 | SYS04 | V106 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | contratos |
| IFV1-F6-C0051 | SYS04 | V107 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | fontes_normativas |
| IFV1-F6-C0052 | SYS04 | V108 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | propostas_orcamentarias |
| IFV1-F6-C0053 | SYS04 | V109 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | listas_verificacao |
| IFV1-F6-C0054 | SYS04 | V110 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | documentos_contrato |
| IFV1-F6-C0055 | SYS04 | V111 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | documentos_contrato |
| IFV1-F6-C0056 | SYS04 | V112 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | competencias |
| IFV1-F6-C0057 | SYS04 | V113 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | criar_competencia |
| IFV1-F6-C0058 | SYS04 | V114 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_visao_geral_competencia |
| IFV1-F6-C0059 | SYS04 | V115 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_documentos_competencia_v115 |
| IFV1-F6-C0060 | SYS04 | V116 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_analise_competencia_v116 |
| IFV1-F6-C0061 | SYS04 | V117 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_detalhe_requisito_v117 |
| IFV1-F6-C0062 | SYS04 | V118 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | pareceres_internos |
| IFV1-F6-C0063 | SYS04 | V119 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | obter_visao_geral_competencia |
| IFV1-F6-C0064 | SYS04 | V120 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | apresentacoes_contratante |
| IFV1-F6-C0065 | SYS04 | V121 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | relatorios_historicos_contratante |
| IFV1-F6-C0066 | SYS04 | V122 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | relatorios_historicos_contratante |
| IFV1-F6-C0067 | SYS04 | V123 | CONDICIONAL | F6.1 | criar_organizacao | eventos_auditoria |
| IFV1-F6-C0068 | SYS04 | V123 | OBRIGATORIA | F6.1 | preferencia_de_organizacao_selecionada | eventos_auditoria |
| IFV1-F6-C0093 | V102 | V101 | OBRIGATORIA | F6.2 | contratantes | contratantes |
| IFV1-F6-C0096 | V102 | V103 | OBRIGATORIA | F6.2 | contratantes | contratantes |
| IFV1-F6-C0098 | V102 | V105 | OBRIGATORIA | F6.2 | contratantes | contratantes |
| IFV1-F6-C0100 | V102 | V123 | CONDICIONAL | F6.2 | contratantes | eventos_auditoria |
| IFV1-F6-C0107 | V103 | V101 | OBRIGATORIA | F6.2 | atualizar_contratante | contratantes |
| IFV1-F6-C0111 | V103 | V104 | OBRIGATORIA | F6.2 | atualizar_contratante | contratos |
| IFV1-F6-C0113 | V103 | V105 | OBRIGATORIA | F6.2 | atualizar_contratante | contratantes |
| IFV1-F6-C0115 | V103 | V106 | OBRIGATORIA | F6.2 | atualizar_contratante | contratantes |
| IFV1-F6-C0116 | V103 | V123 | CONDICIONAL | F6.2 | atualizar_contratante | eventos_auditoria |
| IFV1-F6-C0132 | V105 | SYS05 | OBRIGATORIA | F6.2 | contratos | obter_resumo_dashboard |
| IFV1-F6-C0136 | V105 | V104 | OBRIGATORIA | F6.2 | contratos | contratos |
| IFV1-F6-C0139 | V105 | V106 | OBRIGATORIA | F6.2 | contratos | contratos |
| IFV1-F6-C0140 | V105 | V123 | CONDICIONAL | F6.2 | contratos | eventos_auditoria |
| IFV1-F6-C0146 | V106 | SYS05 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | obter_resumo_dashboard |
| IFV1-F6-C0153 | V106 | V107 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0156 | V106 | V108 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0159 | V106 | V109 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0162 | V106 | V110 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0165 | V106 | V111 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0167 | V106 | V112 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0170 | V106 | V113 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0172 | V106 | V121 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0174 | V106 | V122 | OBRIGATORIA | F6.2 | atualizar_contrato_v1 | contratos |
| IFV1-F6-C0176 | V106 | V123 | CONDICIONAL | F6.2 | atualizar_contrato_v1 | eventos_auditoria |
| IFV1-F6-C0192 | V107 | V109 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | listas_verificacao |
| IFV1-F6-C0200 | V107 | V113 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | criar_competencia |
| IFV1-F6-C0202 | V107 | V116 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | obter_analise_competencia_v116 |
| IFV1-F6-C0203 | V107 | V117 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | obter_detalhe_requisito_v117 |
| IFV1-F6-C0204 | V107 | V118 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | pareceres_internos |
| IFV1-F6-C0205 | V107 | V119 | OBRIGATORIA | F6.3 | definir_aplicabilidade_fonte_v107 | obter_visao_geral_competencia |
| IFV1-F6-C0208 | V107 | V123 | CONDICIONAL | F6.3 | definir_aplicabilidade_fonte_v107 | eventos_auditoria |
| IFV1-F6-C0232 | V108 | V116 | OBRIGATORIA | F6.3 | publicar_versao_proposta_v108 | obter_analise_competencia_v116 |
| IFV1-F6-C0233 | V108 | V118 | OBRIGATORIA | F6.3 | publicar_versao_proposta_v108 | pareceres_internos |
| IFV1-F6-C0234 | V108 | V119 | OBRIGATORIA | F6.3 | publicar_versao_proposta_v108 | obter_visao_geral_competencia |
| IFV1-F6-C0237 | V108 | V123 | CONDICIONAL | F6.3 | publicar_versao_proposta_v108 | eventos_auditoria |
| IFV1-F6-C0260 | V109 | V113 | OBRIGATORIA | F6.3 | executar_comando_lista_v1 | criar_competencia |
| IFV1-F6-C0262 | V109 | V114 | OBRIGATORIA | F6.3 | executar_comando_lista_v1 | obter_visao_geral_competencia |
| IFV1-F6-C0263 | V109 | V115 | OBRIGATORIA | F6.3 | executar_comando_lista_v1 | obter_documentos_competencia_v115 |
| IFV1-F6-C0264 | V109 | V116 | OBRIGATORIA | F6.3 | executar_comando_lista_v1 | obter_analise_competencia_v116 |
| IFV1-F6-C0265 | V109 | V117 | OBRIGATORIA | F6.3 | executar_comando_lista_v1 | obter_detalhe_requisito_v117 |
| IFV1-F6-C0268 | V109 | V123 | CONDICIONAL | F6.3 | executar_comando_lista_v1 | eventos_auditoria |
| IFV1-F6-C0288 | V110 | V111 | OBRIGATORIA | F6.4 | criar_documento_contrato_completo | documentos_contrato |
| IFV1-F6-C0294 | V110 | V116 | OBRIGATORIA | F6.4 | criar_documento_contrato_completo | obter_analise_competencia_v116 |
| IFV1-F6-C0297 | V110 | V123 | CONDICIONAL | F6.4 | criar_documento_contrato_completo | eventos_auditoria |
| IFV1-F6-C0311 | V111 | V107 | OBRIGATORIA | F6.4 | adicionar_versao_documento_contrato | fontes_normativas |
| IFV1-F6-C0315 | V111 | V110 | OBRIGATORIA | F6.4 | adicionar_versao_documento_contrato | documentos_contrato |
| IFV1-F6-C0320 | V111 | V116 | OBRIGATORIA | F6.4 | adicionar_versao_documento_contrato | obter_analise_competencia_v116 |
| IFV1-F6-C0321 | V111 | V117 | OBRIGATORIA | F6.4 | adicionar_versao_documento_contrato | obter_detalhe_requisito_v117 |
| IFV1-F6-C0324 | V111 | V123 | CONDICIONAL | F6.4 | adicionar_versao_documento_contrato | eventos_auditoria |
| IFV1-F6-C0352 | V113 | SYS05 | OBRIGATORIA | F6.5 | criar_competencia | obter_resumo_dashboard |
| IFV1-F6-C0365 | V113 | V112 | OBRIGATORIA | F6.5 | criar_competencia | competencias |
| IFV1-F6-C0368 | V113 | V114 | OBRIGATORIA | F6.5 | criar_competencia | obter_visao_geral_competencia |
| IFV1-F6-C0369 | V113 | V115 | OBRIGATORIA | F6.5 | criar_competencia | obter_documentos_competencia_v115 |
| IFV1-F6-C0370 | V113 | V116 | OBRIGATORIA | F6.5 | criar_competencia | obter_analise_competencia_v116 |
| IFV1-F6-C0371 | V113 | V118 | OBRIGATORIA | F6.5 | criar_competencia | pareceres_internos |
| IFV1-F6-C0372 | V113 | V119 | OBRIGATORIA | F6.5 | criar_competencia | obter_visao_geral_competencia |
| IFV1-F6-C0373 | V113 | V120 | OBRIGATORIA | F6.5 | criar_competencia | apresentacoes_contratante |
| IFV1-F6-C0376 | V113 | V123 | CONDICIONAL | F6.5 | criar_competencia | eventos_auditoria |
| IFV1-F6-C0410 | V115 | V114 | OBRIGATORIA | F6.4 | criar_documento_competencia_v115 | obter_visao_geral_competencia |
| IFV1-F6-C0413 | V115 | V116 | OBRIGATORIA | F6.4 | criar_documento_competencia_v115 | obter_analise_competencia_v116 |
| IFV1-F6-C0415 | V115 | V117 | OBRIGATORIA | F6.4 | criar_documento_competencia_v115 | obter_detalhe_requisito_v117 |
| IFV1-F6-C0416 | V115 | V118 | OBRIGATORIA | F6.4 | criar_documento_competencia_v115 | pareceres_internos |
| IFV1-F6-C0418 | V115 | V119 | OBRIGATORIA | F6.4 | criar_documento_competencia_v115 | obter_visao_geral_competencia |
| IFV1-F6-C0420 | V115 | V123 | CONDICIONAL | F6.4 | criar_documento_competencia_v115 | eventos_auditoria |
| IFV1-F6-C0433 | V116 | V114 | OBRIGATORIA | F6.5 | solicitar_analise_competencia | obter_visao_geral_competencia |
| IFV1-F6-C0437 | V116 | V117 | OBRIGATORIA | F6.5 | solicitar_analise_competencia | obter_detalhe_requisito_v117 |
| IFV1-F6-C0439 | V116 | V118 | OBRIGATORIA | F6.5 | solicitar_analise_competencia | pareceres_internos |
| IFV1-F6-C0441 | V116 | V119 | OBRIGATORIA | F6.5 | solicitar_analise_competencia | obter_visao_geral_competencia |
| IFV1-F6-C0443 | V116 | V123 | CONDICIONAL | F6.5 | solicitar_analise_competencia | eventos_auditoria |
| IFV1-F6-C0455 | V117 | V114 | OBRIGATORIA | F6.5 | registrar_revisao_requisito_v117 | obter_visao_geral_competencia |
| IFV1-F6-C0458 | V117 | V116 | OBRIGATORIA | F6.5 | registrar_revisao_requisito_v117 | obter_analise_competencia_v116 |
| IFV1-F6-C0461 | V117 | V118 | OBRIGATORIA | F6.5 | registrar_revisao_requisito_v117 | pareceres_internos |
| IFV1-F6-C0463 | V117 | V119 | OBRIGATORIA | F6.5 | registrar_revisao_requisito_v117 | obter_visao_geral_competencia |
| IFV1-F6-C0465 | V117 | V123 | CONDICIONAL | F6.5 | registrar_revisao_requisito_v117 | eventos_auditoria |
| IFV1-F6-C0477 | V118 | V114 | OBRIGATORIA | F6.6 | aprovar_parecer_interno | obter_visao_geral_competencia |
| IFV1-F6-C0482 | V118 | V119 | OBRIGATORIA | F6.6 | aprovar_parecer_interno | obter_visao_geral_competencia |
| IFV1-F6-C0484 | V118 | V123 | CONDICIONAL | F6.6 | aprovar_parecer_interno | eventos_auditoria |
| IFV1-F6-C0496 | V119 | V114 | OBRIGATORIA | F6.6 | registrar_apresentacao | obter_visao_geral_competencia |
| IFV1-F6-C0502 | V119 | V120 | OBRIGATORIA | F6.6 | registrar_apresentacao | apresentacoes_contratante |
| IFV1-F6-C0504 | V119 | V123 | CONDICIONAL | F6.6 | registrar_apresentacao | eventos_auditoria |
| IFV1-F6-C0562 | V122 | V116 | OBRIGATORIA | F6.6 | registrar_relatorio_historico_hml | obter_analise_competencia_v116 |
| IFV1-F6-C0563 | V122 | V117 | OBRIGATORIA | F6.6 | registrar_relatorio_historico_hml | obter_detalhe_requisito_v117 |
| IFV1-F6-C0564 | V122 | V121 | OBRIGATORIA | F6.6 | registrar_relatorio_historico_hml | relatorios_historicos_contratante |
| IFV1-F6-C0567 | V122 | V123 | CONDICIONAL | F6.6 | registrar_relatorio_historico_hml | eventos_auditoria |
