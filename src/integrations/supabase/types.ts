export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      acessos_pacote_evidencias: {
        Row: {
          criado_em: string
          criado_por: string | null
          descricao_destinatario: string | null
          expira_em: string
          id: string
          id_organizacao: string
          id_pacote: string
          max_acessos: number | null
          quantidade_acessos: number
          revogado_em: string | null
          token_hash: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          descricao_destinatario?: string | null
          expira_em: string
          id?: string
          id_organizacao: string
          id_pacote: string
          max_acessos?: number | null
          quantidade_acessos?: number
          revogado_em?: string | null
          token_hash: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          descricao_destinatario?: string | null
          expira_em?: string
          id?: string
          id_organizacao?: string
          id_pacote?: string
          max_acessos?: number | null
          quantidade_acessos?: number
          revogado_em?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "acessos_pacote_evidencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_pacote_evidencias_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_evidencias"
            referencedColumns: ["id"]
          },
        ]
      }
      acoes_corretivas: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string
          id: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_evidencia_versao_documento: string | null
          id_organizacao: string
          observacao: string | null
          prazo: string | null
          responsavel: string | null
          status: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao: string
          id?: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_evidencia_versao_documento?: string | null
          id_organizacao: string
          observacao?: string | null
          prazo?: string | null
          responsavel?: string | null
          status?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string
          id?: string
          id_apontamento?: string
          id_competencia?: string
          id_contrato?: string
          id_evidencia_versao_documento?: string | null
          id_organizacao?: string
          observacao?: string | null
          prazo?: string | null
          responsavel?: string | null
          status?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "acoes_corretivas_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_internos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_id_evidencia_versao_documento_fkey"
            columns: ["id_evidencia_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_6cd62f8d80c1"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      alertas_historicos_transversais: {
        Row: {
          categoria: string | null
          competencia_origem: string | null
          criado_em: string
          desfecho_origem: string | null
          divergente: boolean
          efeito_portao: boolean
          evidencias: Json
          id: string
          id_competencia_alvo: string | null
          id_contratante: string | null
          id_contrato_alvo: string
          id_contrato_origem: string
          id_organizacao: string
          id_precedente: string
          id_relatorio_origem: string | null
          item_origem: string | null
          motivo_sinalizacao: string | null
          origem_detalhes: Json
          rotulo: string
          score: number | null
          similaridade: number | null
          status: string
          unidade_origem: string | null
        }
        Insert: {
          categoria?: string | null
          competencia_origem?: string | null
          criado_em?: string
          desfecho_origem?: string | null
          divergente?: boolean
          efeito_portao?: boolean
          evidencias?: Json
          id?: string
          id_competencia_alvo?: string | null
          id_contratante?: string | null
          id_contrato_alvo: string
          id_contrato_origem: string
          id_organizacao: string
          id_precedente: string
          id_relatorio_origem?: string | null
          item_origem?: string | null
          motivo_sinalizacao?: string | null
          origem_detalhes?: Json
          rotulo?: string
          score?: number | null
          similaridade?: number | null
          status?: string
          unidade_origem?: string | null
        }
        Update: {
          categoria?: string | null
          competencia_origem?: string | null
          criado_em?: string
          desfecho_origem?: string | null
          divergente?: boolean
          efeito_portao?: boolean
          evidencias?: Json
          id?: string
          id_competencia_alvo?: string | null
          id_contratante?: string | null
          id_contrato_alvo?: string
          id_contrato_origem?: string
          id_organizacao?: string
          id_precedente?: string
          id_relatorio_origem?: string | null
          item_origem?: string | null
          motivo_sinalizacao?: string | null
          origem_detalhes?: Json
          rotulo?: string
          score?: number | null
          similaridade?: number | null
          status?: string
          unidade_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_historicos_transversais_id_competencia_alvo_fkey"
            columns: ["id_competencia_alvo"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_contrato_alvo_fkey"
            columns: ["id_contrato_alvo"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_contrato_origem_fkey"
            columns: ["id_contrato_origem"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_precedente_fkey"
            columns: ["id_precedente"]
            isOneToOne: false
            referencedRelation: "precedentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historicos_transversais_id_relatorio_origem_fkey"
            columns: ["id_relatorio_origem"]
            isOneToOne: false
            referencedRelation: "relatorios_historicos_contratante"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_operacionais: {
        Row: {
          codigo: string
          criado_em: string
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          id_organizacao: string | null
          mensagem: string
          metadados: Json
          ocorrencias: number
          primeira_ocorrencia: string
          reconhecido_em: string | null
          reconhecido_por: string | null
          resolvido_em: string | null
          severidade: string
          status: string
          titulo: string
          ultima_ocorrencia: string
        }
        Insert: {
          codigo: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          id_organizacao?: string | null
          mensagem: string
          metadados?: Json
          ocorrencias?: number
          primeira_ocorrencia?: string
          reconhecido_em?: string | null
          reconhecido_por?: string | null
          resolvido_em?: string | null
          severidade: string
          status?: string
          titulo: string
          ultima_ocorrencia?: string
        }
        Update: {
          codigo?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          id_organizacao?: string | null
          mensagem?: string
          metadados?: Json
          ocorrencias?: number
          primeira_ocorrencia?: string
          reconhecido_em?: string | null
          reconhecido_por?: string | null
          resolvido_em?: string | null
          severidade?: string
          status?: string
          titulo?: string
          ultima_ocorrencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_operacionais_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_preventivos: {
        Row: {
          codigo_regra: string | null
          criado_em: string
          descricao: string
          evidencia: Json
          evidencias_futuras: Json
          grupo_chave: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          id_transacao: string | null
          idempotency_key: string | null
          impacto_financeiro: number | null
          limiar_agrupamento: number | null
          origem_id: string | null
          origem_tipo: string
          quantidade_agrupada: number
          regra: string
          responsavel: string | null
          severidade: string
          status: string
        }
        Insert: {
          codigo_regra?: string | null
          criado_em?: string
          descricao: string
          evidencia?: Json
          evidencias_futuras?: Json
          grupo_chave?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          id_transacao?: string | null
          idempotency_key?: string | null
          impacto_financeiro?: number | null
          limiar_agrupamento?: number | null
          origem_id?: string | null
          origem_tipo?: string
          quantidade_agrupada?: number
          regra: string
          responsavel?: string | null
          severidade: string
          status?: string
        }
        Update: {
          codigo_regra?: string | null
          criado_em?: string
          descricao?: string
          evidencia?: Json
          evidencias_futuras?: Json
          grupo_chave?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_transacao?: string | null
          idempotency_key?: string | null
          impacto_financeiro?: number | null
          limiar_agrupamento?: number | null
          origem_id?: string | null
          origem_tipo?: string
          quantidade_agrupada?: number
          regra?: string
          responsavel?: string | null
          severidade?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_preventivos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_preventivos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_preventivos_id_transacao_fkey"
            columns: ["id_transacao"]
            isOneToOne: false
            referencedRelation: "transacoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_2595b3b2e5bd"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      alteracoes_normativas: {
        Row: {
          criado_em: string
          detectada_em: string
          id: string
          id_fonte: string | null
          id_organizacao: string
          id_versao_anterior: string | null
          id_versao_nova: string | null
          resumo: string
          status: string
        }
        Insert: {
          criado_em?: string
          detectada_em?: string
          id?: string
          id_fonte?: string | null
          id_organizacao: string
          id_versao_anterior?: string | null
          id_versao_nova?: string | null
          resumo: string
          status?: string
        }
        Update: {
          criado_em?: string
          detectada_em?: string
          id?: string
          id_fonte?: string | null
          id_organizacao?: string
          id_versao_anterior?: string | null
          id_versao_nova?: string | null
          resumo?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alteracoes_normativas_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alteracoes_normativas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alteracoes_normativas_id_versao_anterior_fkey"
            columns: ["id_versao_anterior"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alteracoes_normativas_id_versao_nova_fkey"
            columns: ["id_versao_nova"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_apontamentos: {
        Row: {
          classificacao: string
          criado_em: string
          criado_por: string | null
          evidencias: Json
          fundamento: string
          id: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          revisado_em: string | null
          revisado_por: string | null
        }
        Insert: {
          classificacao: string
          criado_em?: string
          criado_por?: string | null
          evidencias?: Json
          fundamento: string
          id?: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          revisado_em?: string | null
          revisado_por?: string | null
        }
        Update: {
          classificacao?: string
          criado_em?: string
          criado_por?: string | null
          evidencias?: Json
          fundamento?: string
          id?: string
          id_apontamento?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          revisado_em?: string | null
          revisado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_apontamentos_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_apontamentos_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_apontamentos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_apontamentos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_4d795a148874"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      aplicabilidades_controle: {
        Row: {
          ativo: boolean
          atualizado_em: string
          bloqueia_competencia: boolean | null
          configuracao: Json
          criado_em: string
          criado_por: string | null
          id: string
          id_contrato: string | null
          id_controle: string
          id_organizacao: string
          responsavel: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          bloqueia_competencia?: boolean | null
          configuracao?: Json
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_contrato?: string | null
          id_controle: string
          id_organizacao: string
          responsavel?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          bloqueia_competencia?: boolean | null
          configuracao?: Json
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_contrato?: string | null
          id_controle?: string
          id_organizacao?: string
          responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aplicabilidades_controle_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicabilidades_controle_id_controle_fkey"
            columns: ["id_controle"]
            isOneToOne: false
            referencedRelation: "controles_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicabilidades_controle_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_07c0be83de32"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      aplicabilidades_fonte: {
        Row: {
          aplicavel: boolean
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string
          criado_em: string
          fundamento: string | null
          id: string
          id_contrato: string
          id_fonte_versao: string
          id_organizacao: string
        }
        Insert: {
          aplicavel?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string
          criado_em?: string
          fundamento?: string | null
          id?: string
          id_contrato: string
          id_fonte_versao: string
          id_organizacao: string
        }
        Update: {
          aplicavel?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string
          criado_em?: string
          fundamento?: string | null
          id?: string
          id_contrato?: string
          id_fonte_versao?: string
          id_organizacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "aplicabilidades_fonte_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicabilidades_fonte_id_fonte_versao_fkey"
            columns: ["id_fonte_versao"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicabilidades_fonte_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_b7c418a51419"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      apontamentos_contratante: {
        Row: {
          atualizado_em: string
          classificacao_sugerida: string | null
          codigo: string | null
          confianca_classificacao: number | null
          criado_em: string
          descricao: string
          fonte_pagina: number | null
          fonte_trecho: string | null
          fundamento: string | null
          glosa_potencial: number | null
          id: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          impacto_financeiro_estimado: number | null
          severidade: string
          status: string
          valor_aceito: number | null
          valor_questionado: number | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          classificacao_sugerida?: string | null
          codigo?: string | null
          confianca_classificacao?: number | null
          criado_em?: string
          descricao: string
          fonte_pagina?: number | null
          fonte_trecho?: string | null
          fundamento?: string | null
          glosa_potencial?: number | null
          id?: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          impacto_financeiro_estimado?: number | null
          severidade?: string
          status?: string
          valor_aceito?: number | null
          valor_questionado?: number | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          classificacao_sugerida?: string | null
          codigo?: string | null
          confianca_classificacao?: number | null
          criado_em?: string
          descricao?: string
          fonte_pagina?: number | null
          fonte_trecho?: string | null
          fundamento?: string | null
          glosa_potencial?: number | null
          id?: string
          id_ciclo?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          impacto_financeiro_estimado?: number | null
          severidade?: string
          status?: string
          valor_aceito?: number | null
          valor_questionado?: number | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_contratante_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_contratante_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_contratante_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_contratante_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_9deb1d569238"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      apontamentos_historicos: {
        Row: {
          criado_em: string
          fonte_pagina: number | null
          fonte_trecho: string | null
          fundamento: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          id_relatorio: string
          item: string | null
          problema: string
          severidade: string | null
        }
        Insert: {
          criado_em?: string
          fonte_pagina?: number | null
          fonte_trecho?: string | null
          fundamento?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          id_relatorio: string
          item?: string | null
          problema: string
          severidade?: string | null
        }
        Update: {
          criado_em?: string
          fonte_pagina?: number | null
          fonte_trecho?: string | null
          fundamento?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_relatorio?: string
          item?: string | null
          problema?: string
          severidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_historicos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_historicos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_historicos_id_relatorio_fkey"
            columns: ["id_relatorio"]
            isOneToOne: false
            referencedRelation: "relatorios_historicos_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_955baab4e8a6"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      apontamentos_internos: {
        Row: {
          acao_sugerida: string | null
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          descricao: string
          fonte: Json
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_requisito: string | null
          origem: string
          regra_violada: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          severidade: string
          status: string
          versao_registro: number
        }
        Insert: {
          acao_sugerida?: string | null
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao: string
          fonte?: Json
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_requisito?: string | null
          origem?: string
          regra_violada?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          status?: string
          versao_registro?: number
        }
        Update: {
          acao_sugerida?: string | null
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string
          fonte?: Json
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          id_requisito?: string | null
          origem?: string
          regra_violada?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          status?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_internos_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_internos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_internos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_internos_id_requisito_fkey"
            columns: ["id_requisito"]
            isOneToOne: false
            referencedRelation: "requisitos_competencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_8017411456d9"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      apresentacoes_contratante: {
        Row: {
          apresentado_em: string
          apresentado_por: string | null
          criado_em: string
          forma_apresentacao: string | null
          id: string
          id_competencia: string
          id_comprovante_arquivo: string | null
          id_contrato: string
          id_organizacao: string
          id_pacote: string
          idempotency_key: string
          numero_rodada: number
          protocolo: string | null
          tipo: string
        }
        Insert: {
          apresentado_em?: string
          apresentado_por?: string | null
          criado_em?: string
          forma_apresentacao?: string | null
          id?: string
          id_competencia: string
          id_comprovante_arquivo?: string | null
          id_contrato: string
          id_organizacao: string
          id_pacote: string
          idempotency_key: string
          numero_rodada?: number
          protocolo?: string | null
          tipo?: string
        }
        Update: {
          apresentado_em?: string
          apresentado_por?: string | null
          criado_em?: string
          forma_apresentacao?: string | null
          id?: string
          id_competencia?: string
          id_comprovante_arquivo?: string | null
          id_contrato?: string
          id_organizacao?: string
          id_pacote?: string
          idempotency_key?: string
          numero_rodada?: number
          protocolo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "apresentacoes_contratante_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_contratante_id_comprovante_arquivo_fkey"
            columns: ["id_comprovante_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_contratante_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_contratante_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_contratante_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_competencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_36dc4ed0e694"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      aprovacoes: {
        Row: {
          aprovado_por: string | null
          criado_em: string
          fundamento: string | null
          hash_contexto: string
          id: string
          id_competencia: string
          id_contrato: string
          id_execucao_analise: string | null
          id_organizacao: string
          percentual_conformidade: number | null
          status: string
          tipo: string
        }
        Insert: {
          aprovado_por?: string | null
          criado_em?: string
          fundamento?: string | null
          hash_contexto: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_execucao_analise?: string | null
          id_organizacao: string
          percentual_conformidade?: number | null
          status?: string
          tipo: string
        }
        Update: {
          aprovado_por?: string | null
          criado_em?: string
          fundamento?: string | null
          hash_contexto?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_execucao_analise?: string | null
          id_organizacao?: string
          percentual_conformidade?: number | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "aprovacoes_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_id_execucao_analise_fkey"
            columns: ["id_execucao_analise"]
            isOneToOne: false
            referencedRelation: "execucoes_analise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_ed431c12bea5"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      arquivos: {
        Row: {
          bucket: string
          criado_em: string
          criado_por: string | null
          id: string
          id_contrato: string | null
          id_organizacao: string
          mime: string | null
          nome_original: string
          origem: string
          path: string
          sha256: string
          status_seguranca: string
          tamanho: number
        }
        Insert: {
          bucket?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          mime?: string | null
          nome_original: string
          origem?: string
          path: string
          sha256: string
          status_seguranca?: string
          tamanho?: number
        }
        Update: {
          bucket?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          mime?: string | null
          nome_original?: string
          origem?: string
          path?: string
          sha256?: string
          status_seguranca?: string
          tamanho?: number
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_bde36378cd95"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      assinaturas_eventos_integracao: {
        Row: {
          algoritmo: string
          ativo: boolean
          criado_em: string
          criado_por: string | null
          id: string
          id_organizacao: string
          id_webhook: string | null
          secret_hash: string
          valido_ate: string | null
          valido_desde: string
          vault_secret_name: string | null
          versao: number
        }
        Insert: {
          algoritmo?: string
          ativo?: boolean
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_organizacao: string
          id_webhook?: string | null
          secret_hash: string
          valido_ate?: string | null
          valido_desde?: string
          vault_secret_name?: string | null
          versao: number
        }
        Update: {
          algoritmo?: string
          ativo?: boolean
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_organizacao?: string
          id_webhook?: string | null
          secret_hash?: string
          valido_ate?: string | null
          valido_desde?: string
          vault_secret_name?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_eventos_integracao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_eventos_integracao_id_webhook_fkey"
            columns: ["id_webhook"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_impacto: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          contratos_afetados: string[]
          controles_afetados: string[]
          criado_em: string
          criado_por: string | null
          decisao: string
          id: string
          id_alteracao: string
          id_organizacao: string
          impacto: string
          metadados: Json
          status: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          contratos_afetados?: string[]
          controles_afetados?: string[]
          criado_em?: string
          criado_por?: string | null
          decisao: string
          id?: string
          id_alteracao: string
          id_organizacao: string
          impacto: string
          metadados?: Json
          status?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          contratos_afetados?: string[]
          controles_afetados?: string[]
          criado_em?: string
          criado_por?: string | null
          decisao?: string
          id?: string
          id_alteracao?: string
          id_organizacao?: string
          impacto?: string
          metadados?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_impacto_id_alteracao_fkey"
            columns: ["id_alteracao"]
            isOneToOne: false
            referencedRelation: "alteracoes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_impacto_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_mensagens_sistema: {
        Row: {
          atualizado_em: string
          categoria: string
          codigo: string
          criado_em: string
          exibir_detalhe_tecnico: boolean
          mensagem: string
          orientacao: string | null
          severidade: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string
          categoria: string
          codigo: string
          criado_em?: string
          exibir_detalhe_tecnico?: boolean
          mensagem: string
          orientacao?: string | null
          severidade: string
          titulo: string
        }
        Update: {
          atualizado_em?: string
          categoria?: string
          codigo?: string
          criado_em?: string
          exibir_detalhe_tecnico?: boolean
          mensagem?: string
          orientacao?: string | null
          severidade?: string
          titulo?: string
        }
        Relationships: []
      }
      catalogo_status_ui: {
        Row: {
          codigo: string
          criado_em: string
          descricao: string | null
          dominio: string
          ordem: number
          rotulo: string
          tom: string
        }
        Insert: {
          codigo: string
          criado_em?: string
          descricao?: string | null
          dominio: string
          ordem?: number
          rotulo: string
          tom?: string
        }
        Update: {
          codigo?: string
          criado_em?: string
          descricao?: string | null
          dominio?: string
          ordem?: number
          rotulo?: string
          tom?: string
        }
        Relationships: []
      }
      ciclos_diligencia: {
        Row: {
          atualizado_em: string
          criado_em: string
          encerrado_em: string | null
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero_rodada: number
          prazo_resposta: string | null
          recebido_em: string
          status: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          encerrado_em?: string | null
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero_rodada: number
          prazo_resposta?: string | null
          recebido_em?: string
          status?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          encerrado_em?: string | null
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          numero_rodada?: number
          prazo_resposta?: string | null
          recebido_em?: string
          status?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "ciclos_diligencia_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ciclos_diligencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ciclos_diligencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_a5e6e0ce38aa"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      clientes_api: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          id: string
          id_organizacao: string
          identificador: string
          limite_por_minuto: number
          nome: string
          rotacionado_em: string | null
          secret_hash: string
          ultimo_uso_em: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_organizacao: string
          identificador: string
          limite_por_minuto?: number
          nome: string
          rotacionado_em?: string | null
          secret_hash: string
          ultimo_uso_em?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_organizacao?: string
          identificador?: string
          limite_por_minuto?: number
          nome?: string
          rotacionado_em?: string | null
          secret_hash?: string
          ultimo_uso_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_api_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comandos_idempotentes: {
        Row: {
          atualizado_em: string
          chave: string
          comando: string
          criado_em: string
          expira_em: string | null
          hash_payload: string | null
          id: string
          id_organizacao: string
          resposta: Json | null
          status: string
        }
        Insert: {
          atualizado_em?: string
          chave: string
          comando: string
          criado_em?: string
          expira_em?: string | null
          hash_payload?: string | null
          id?: string
          id_organizacao: string
          resposta?: Json | null
          status?: string
        }
        Update: {
          atualizado_em?: string
          chave?: string
          comando?: string
          criado_em?: string
          expira_em?: string | null
          hash_payload?: string | null
          id?: string
          id_organizacao?: string
          resposta?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comandos_idempotentes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      competencias: {
        Row: {
          atualizado_em: string
          competencia_referencia: string
          criado_em: string
          data_limite: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          liberada_para_apresentacao_em: string | null
          liberada_para_reapresentacao_em: string | null
          percentual_conformidade: number
          periodo_fim: string
          periodo_inicio: string
          situacao: string
          validada_em: string | null
          versao_pacote_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          competencia_referencia: string
          criado_em?: string
          data_limite?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          liberada_para_apresentacao_em?: string | null
          liberada_para_reapresentacao_em?: string | null
          percentual_conformidade?: number
          periodo_fim: string
          periodo_inicio: string
          situacao?: string
          validada_em?: string | null
          versao_pacote_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          competencia_referencia?: string
          criado_em?: string
          data_limite?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          liberada_para_apresentacao_em?: string | null
          liberada_para_reapresentacao_em?: string | null
          percentual_conformidade?: number
          periodo_fim?: string
          periodo_inicio?: string
          situacao?: string
          validada_em?: string | null
          versao_pacote_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "competencias_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_e720da96fb0a"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      conciliacoes: {
        Row: {
          concluido_em: string | null
          concluido_por: string | null
          criado_em: string
          diferenca: number | null
          id: string
          id_contrato: string
          id_organizacao: string
          periodo: string
          resultado: Json
          saldo_contaos: number | null
          saldo_origem: number | null
          status: string
          tipo: string
        }
        Insert: {
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          diferenca?: number | null
          id?: string
          id_contrato: string
          id_organizacao: string
          periodo: string
          resultado?: Json
          saldo_contaos?: number | null
          saldo_origem?: number | null
          status?: string
          tipo: string
        }
        Update: {
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          diferenca?: number | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          periodo?: string
          resultado?: Json
          saldo_contaos?: number | null
          saldo_origem?: number | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_01338edf86c0"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      configuracao_api: {
        Row: {
          atualizado_em: string
          id: boolean
          max_tentativas_integracao: number
          tamanho_pagina_maximo: number
          tamanho_pagina_padrao: number
          timeout_integracao_ms: number
        }
        Insert: {
          atualizado_em?: string
          id?: boolean
          max_tentativas_integracao?: number
          tamanho_pagina_maximo?: number
          tamanho_pagina_padrao?: number
          timeout_integracao_ms?: number
        }
        Update: {
          atualizado_em?: string
          id?: boolean
          max_tentativas_integracao?: number
          tamanho_pagina_maximo?: number
          tamanho_pagina_padrao?: number
          timeout_integracao_ms?: number
        }
        Relationships: []
      }
      configuracao_localizacao: {
        Row: {
          atualizado_em: string
          formato_data: string
          formato_data_hora: string
          formato_hora: string
          id: boolean
          idioma: string
          moeda: string
          separador_decimal: string
          separador_milhar: string
          timezone: string
        }
        Insert: {
          atualizado_em?: string
          formato_data?: string
          formato_data_hora?: string
          formato_hora?: string
          id?: boolean
          idioma?: string
          moeda?: string
          separador_decimal?: string
          separador_milhar?: string
          timezone?: string
        }
        Update: {
          atualizado_em?: string
          formato_data?: string
          formato_data_hora?: string
          formato_hora?: string
          id?: boolean
          idioma?: string
          moeda?: string
          separador_decimal?: string
          separador_milhar?: string
          timezone?: string
        }
        Relationships: []
      }
      configuracao_upload: {
        Row: {
          atualizado_em: string
          extensoes_permitidas: string[]
          id: boolean
          limiar_upload_resumivel_bytes: number
          max_colunas_planilha: number
          max_entradas_compactadas: number
          max_linhas_planilha: number
          mimes_permitidos: string[]
          razao_maxima_compactacao: number
          tamanho_maximo_bytes: number | null
          tamanho_maximo_descompactado_bytes: number
          tamanho_maximo_processamento_bytes: number
        }
        Insert: {
          atualizado_em?: string
          extensoes_permitidas?: string[]
          id?: boolean
          limiar_upload_resumivel_bytes?: number
          max_colunas_planilha?: number
          max_entradas_compactadas?: number
          max_linhas_planilha?: number
          mimes_permitidos?: string[]
          razao_maxima_compactacao?: number
          tamanho_maximo_bytes?: number | null
          tamanho_maximo_descompactado_bytes?: number
          tamanho_maximo_processamento_bytes?: number
        }
        Update: {
          atualizado_em?: string
          extensoes_permitidas?: string[]
          id?: boolean
          limiar_upload_resumivel_bytes?: number
          max_colunas_planilha?: number
          max_entradas_compactadas?: number
          max_linhas_planilha?: number
          mimes_permitidos?: string[]
          razao_maxima_compactacao?: number
          tamanho_maximo_bytes?: number | null
          tamanho_maximo_descompactado_bytes?: number
          tamanho_maximo_processamento_bytes?: number
        }
        Relationships: []
      }
      configuracoes_automacao: {
        Row: {
          ativo: boolean
          atualizado_em: string
          configuracao_publica: Json
          criado_em: string
          id: string
          id_organizacao: string
          modelo_ia: string | null
          modelo_ocr: string | null
          modo_ia: string
          modo_ocr: string
          provedor_ia: string
          provedor_ocr: string
          versao_registro: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          configuracao_publica?: Json
          criado_em?: string
          id?: string
          id_organizacao: string
          modelo_ia?: string | null
          modelo_ocr?: string | null
          modo_ia?: string
          modo_ocr?: string
          provedor_ia?: string
          provedor_ocr?: string
          versao_registro?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          configuracao_publica?: Json
          criado_em?: string
          id?: string
          id_organizacao?: string
          modelo_ia?: string | null
          modelo_ocr?: string | null
          modo_ia?: string
          modo_ocr?: string
          provedor_ia?: string
          provedor_ocr?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_automacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: true
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_prevencao_financeira: {
        Row: {
          ativo: boolean
          atualizado_em: string
          conta_bancaria_esperada: string | null
          criado_em: string
          evidencias_futuras_padrao: Json
          id: string
          id_contrato: string
          id_organizacao: string
          janela_duplicidade_dias: number
          limiar_notificacao: number
          limite_alertas_por_grupo: number
          similaridade_duplicidade: number
          similaridade_objeto: number
          versao_registro: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          conta_bancaria_esperada?: string | null
          criado_em?: string
          evidencias_futuras_padrao?: Json
          id?: string
          id_contrato: string
          id_organizacao: string
          janela_duplicidade_dias?: number
          limiar_notificacao?: number
          limite_alertas_por_grupo?: number
          similaridade_duplicidade?: number
          similaridade_objeto?: number
          versao_registro?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          conta_bancaria_esperada?: string | null
          criado_em?: string
          evidencias_futuras_padrao?: Json
          id?: string
          id_contrato?: string
          id_organizacao?: string
          janela_duplicidade_dias?: number
          limiar_notificacao?: number
          limite_alertas_por_grupo?: number
          similaridade_duplicidade?: number
          similaridade_objeto?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_prevencao_financeira_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: true
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configuracoes_prevencao_financeira_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_e85b53b37f9b"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      consultas_semanticas: {
        Row: {
          criado_em: string
          criado_por: string | null
          data_contexto: string | null
          embedding: string | null
          escopo: string
          filtros: Json
          id: string
          id_competencia_contexto: string | null
          id_contrato: string | null
          id_organizacao: string
          modelo: string | null
          status: string
          texto_consulta: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          data_contexto?: string | null
          embedding?: string | null
          escopo: string
          filtros?: Json
          id?: string
          id_competencia_contexto?: string | null
          id_contrato?: string | null
          id_organizacao: string
          modelo?: string | null
          status?: string
          texto_consulta: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          data_contexto?: string | null
          embedding?: string | null
          escopo?: string
          filtros?: Json
          id?: string
          id_competencia_contexto?: string | null
          id_contrato?: string | null
          id_organizacao?: string
          modelo?: string | null
          status?: string
          texto_consulta?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_semanticas_id_competencia_contexto_fkey"
            columns: ["id_competencia_contexto"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_semanticas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_semanticas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_988b0c81c103"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      consumo_orcamentario: {
        Row: {
          confianca: number | null
          criado_em: string
          id: string
          id_contrato: string
          id_linha_orcamentaria: string
          id_organizacao: string
          id_transacao: string
          regra: string | null
          valor_apropriado: number
        }
        Insert: {
          confianca?: number | null
          criado_em?: string
          id?: string
          id_contrato: string
          id_linha_orcamentaria: string
          id_organizacao: string
          id_transacao: string
          regra?: string | null
          valor_apropriado: number
        }
        Update: {
          confianca?: number | null
          criado_em?: string
          id?: string
          id_contrato?: string
          id_linha_orcamentaria?: string
          id_organizacao?: string
          id_transacao?: string
          regra?: string | null
          valor_apropriado?: number
        }
        Relationships: [
          {
            foreignKeyName: "consumo_orcamentario_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_orcamentario_id_linha_orcamentaria_fkey"
            columns: ["id_linha_orcamentaria"]
            isOneToOne: false
            referencedRelation: "linhas_orcamentarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_orcamentario_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_orcamentario_id_transacao_fkey"
            columns: ["id_transacao"]
            isOneToOne: false
            referencedRelation: "transacoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_21d4a6a2e0cb"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      contestacoes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string
          criado_por: string | null
          fundamento: string
          hash: string
          id: string
          id_apontamento: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          justificativa_recomendacao: string | null
          recomendada: boolean
          resultado_final: string | null
          resultado_registrado_em: string | null
          status_aprovacao: string
          texto: string
          versao: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          fundamento: string
          hash: string
          id?: string
          id_apontamento: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          justificativa_recomendacao?: string | null
          recomendada?: boolean
          resultado_final?: string | null
          resultado_registrado_em?: string | null
          status_aprovacao?: string
          texto: string
          versao: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          fundamento?: string
          hash?: string
          id?: string
          id_apontamento?: string
          id_ciclo?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          justificativa_recomendacao?: string | null
          recomendada?: boolean
          resultado_final?: string | null
          resultado_registrado_em?: string | null
          status_aprovacao?: string
          texto?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "contestacoes_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contestacoes_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contestacoes_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contestacoes_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contestacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_fcf76b64ea96"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      contratantes: {
        Row: {
          atualizado_em: string
          contato: Json
          criado_em: string
          documento: string | null
          id: string
          id_organizacao: string
          nome_fantasia: string | null
          razao_social: string
          situacao: string
          tipo_pessoa: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          contato?: Json
          criado_em?: string
          documento?: string | null
          id?: string
          id_organizacao: string
          nome_fantasia?: string | null
          razao_social: string
          situacao?: string
          tipo_pessoa?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          contato?: Json
          criado_em?: string
          documento?: string | null
          id?: string
          id_organizacao?: string
          nome_fantasia?: string | null
          razao_social?: string
          situacao?: string
          tipo_pessoa?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratantes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          atualizado_em: string
          configuracao_diligencia: Json
          configuracao_financeira: Json
          conta_bancaria_vinculada: string | null
          criado_em: string
          criticidade: string
          dia_limite_apresentacao: number | null
          fim: string | null
          fonte_recurso: string | null
          id: string
          id_contratante: string
          id_organizacao: string
          inicio: string
          numero: string
          objeto: string
          periodicidade: string
          prazo_prestacao_dias: number | null
          situacao: string
          tipo_contrato: string | null
          unidade_vinculada: string | null
          valor_global: number | null
          valor_mensal_referencia: number | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          configuracao_diligencia?: Json
          configuracao_financeira?: Json
          conta_bancaria_vinculada?: string | null
          criado_em?: string
          criticidade?: string
          dia_limite_apresentacao?: number | null
          fim?: string | null
          fonte_recurso?: string | null
          id?: string
          id_contratante: string
          id_organizacao: string
          inicio: string
          numero: string
          objeto: string
          periodicidade?: string
          prazo_prestacao_dias?: number | null
          situacao?: string
          tipo_contrato?: string | null
          unidade_vinculada?: string | null
          valor_global?: number | null
          valor_mensal_referencia?: number | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          configuracao_diligencia?: Json
          configuracao_financeira?: Json
          conta_bancaria_vinculada?: string | null
          criado_em?: string
          criticidade?: string
          dia_limite_apresentacao?: number | null
          fim?: string | null
          fonte_recurso?: string | null
          id?: string
          id_contratante?: string
          id_organizacao?: string
          inicio?: string
          numero?: string
          objeto?: string
          periodicidade?: string
          prazo_prestacao_dias?: number | null
          situacao?: string
          tipo_contrato?: string | null
          unidade_vinculada?: string | null
          valor_global?: number | null
          valor_mensal_referencia?: number | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_contratante_org_fk"
            columns: ["id_contratante", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "contratos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_fornecedores: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          id_contrato: string
          id_fornecedor: string
          id_organizacao: string
          numero_instrumento: string | null
          objeto: string | null
          status: string
          valor: number | null
          versao_registro: number
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contrato: string
          id_fornecedor: string
          id_organizacao: string
          numero_instrumento?: string | null
          objeto?: string | null
          status?: string
          valor?: number | null
          versao_registro?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contrato?: string
          id_fornecedor?: string
          id_organizacao?: string
          numero_instrumento?: string | null
          objeto?: string | null
          status?: string
          valor?: number | null
          versao_registro?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_fornecedores_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fornecedores_id_fornecedor_fkey"
            columns: ["id_fornecedor"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fornecedores_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_c6f8300dea0d"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      controles_conformidade: {
        Row: {
          atualizado_em: string
          bloqueia_competencia: boolean
          categoria: string | null
          codigo: string
          criado_em: string
          criticidade: string
          id: string
          id_organizacao: string
          nome: string
          objetivo: string
          responsavel_padrao: string | null
          segregacao_funcoes: boolean
          situacao: string
          versao_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          bloqueia_competencia?: boolean
          categoria?: string | null
          codigo: string
          criado_em?: string
          criticidade?: string
          id?: string
          id_organizacao: string
          nome: string
          objetivo: string
          responsavel_padrao?: string | null
          segregacao_funcoes?: boolean
          situacao?: string
          versao_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          bloqueia_competencia?: boolean
          categoria?: string | null
          codigo?: string
          criado_em?: string
          criticidade?: string
          id?: string
          id_organizacao?: string
          nome?: string
          objetivo?: string
          responsavel_padrao?: string | null
          segregacao_funcoes?: boolean
          situacao?: string
          versao_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "controles_conformidade_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      desfechos_apontamentos: {
        Row: {
          criado_em: string
          criado_por: string | null
          data: string
          id: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          texto: string | null
          tipo_desfecho: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          data?: string
          id?: string
          id_apontamento: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          texto?: string | null
          tipo_desfecho: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          data?: string
          id?: string
          id_apontamento?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          texto?: string | null
          tipo_desfecho?: string
        }
        Relationships: [
          {
            foreignKeyName: "desfechos_apontamentos_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desfechos_apontamentos_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desfechos_apontamentos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desfechos_apontamentos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_2cf8098c7096"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      desfechos_historicos: {
        Row: {
          criado_em: string
          data: string | null
          fundamento: string | null
          id: string
          id_apontamento: string
          id_contrato: string
          id_organizacao: string
          resultado: string
        }
        Insert: {
          criado_em?: string
          data?: string | null
          fundamento?: string | null
          id?: string
          id_apontamento: string
          id_contrato: string
          id_organizacao: string
          resultado: string
        }
        Update: {
          criado_em?: string
          data?: string | null
          fundamento?: string | null
          id?: string
          id_apontamento?: string
          id_contrato?: string
          id_organizacao?: string
          resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "desfechos_historicos_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_historicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desfechos_historicos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desfechos_historicos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_dce447fb78fa"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      documentos_competencia: {
        Row: {
          atualizado_em: string
          categoria: string | null
          criado_em: string
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_requisito_competencia: string | null
          situacao: string
          tipo: string
          titulo: string
          versao_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_requisito_competencia?: string | null
          situacao?: string
          tipo: string
          titulo: string
          versao_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          id_requisito_competencia?: string | null
          situacao?: string
          tipo?: string
          titulo?: string
          versao_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_competencia_competencia_fk"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_competencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_competencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_competencia_requisito_fk"
            columns: ["id_requisito_competencia"]
            isOneToOne: false
            referencedRelation: "requisitos_competencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_56b0ede3d17e"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      documentos_contrato: {
        Row: {
          atualizado_em: string
          categoria: string | null
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          situacao: string
          tipo: string
          titulo: string
          versao_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          situacao?: string
          tipo: string
          titulo: string
          versao_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          situacao?: string
          tipo?: string
          titulo?: string
          versao_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_contrato_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_contrato_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_e860ea4f93f2"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      documentos_transacao: {
        Row: {
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_transacao: string
          id_versao_documento: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_transacao: string
          id_versao_documento: string
          tipo: string
        }
        Update: {
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_transacao?: string
          id_versao_documento?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_transacao_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_transacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_transacao_id_transacao_fkey"
            columns: ["id_transacao"]
            isOneToOne: false
            referencedRelation: "transacoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_transacao_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_4f3fe6ec9ee4"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      entidades_organizacionais: {
        Row: {
          atualizado_em: string
          codigo: string
          criado_em: string
          id: string
          id_organizacao: string
          id_pai: string | null
          metadados: Json
          nome: string
          status: string
          tipo: string | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          codigo: string
          criado_em?: string
          id?: string
          id_organizacao: string
          id_pai?: string | null
          metadados?: Json
          nome: string
          status?: string
          tipo?: string | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          codigo?: string
          criado_em?: string
          id?: string
          id_organizacao?: string
          id_pai?: string | null
          metadados?: Json
          nome?: string
          status?: string
          tipo?: string | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "entidades_organizacionais_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entidades_organizacionais_id_pai_fkey"
            columns: ["id_pai"]
            isOneToOne: false
            referencedRelation: "entidades_organizacionais"
            referencedColumns: ["id"]
          },
        ]
      }
      escopos_clientes_api: {
        Row: {
          criado_em: string
          escopo: string
          id: string
          id_cliente: string
          id_organizacao: string
        }
        Insert: {
          criado_em?: string
          escopo: string
          id?: string
          id_cliente: string
          id_organizacao: string
        }
        Update: {
          criado_em?: string
          escopo?: string
          id?: string
          id_cliente?: string
          id_organizacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "escopos_clientes_api_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes_api"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escopos_clientes_api_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_acesso_pacote_evidencias: {
        Row: {
          criado_em: string
          id: string
          id_acesso: string | null
          id_organizacao: string
          id_pacote: string
          ip_hash: string | null
          metadados: Json
          resultado: string
          user_agent_hash: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          id_acesso?: string | null
          id_organizacao: string
          id_pacote: string
          ip_hash?: string | null
          metadados?: Json
          resultado: string
          user_agent_hash?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          id_acesso?: string | null
          id_organizacao?: string
          id_pacote?: string
          ip_hash?: string | null
          metadados?: Json
          resultado?: string
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_acesso_pacote_evidencias_id_acesso_fkey"
            columns: ["id_acesso"]
            isOneToOne: false
            referencedRelation: "acessos_pacote_evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_acesso_pacote_evidencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_acesso_pacote_evidencias_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_evidencias"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_auditoria: {
        Row: {
          antes: Json | null
          correlation_id: string
          criado_em: string
          depois: Json | null
          entidade: string
          evento: string
          id: string
          id_entidade: string | null
          id_organizacao: string | null
          id_usuario: string | null
          metadados: Json
          origem: string
        }
        Insert: {
          antes?: Json | null
          correlation_id?: string
          criado_em?: string
          depois?: Json | null
          entidade: string
          evento: string
          id?: string
          id_entidade?: string | null
          id_organizacao?: string | null
          id_usuario?: string | null
          metadados?: Json
          origem?: string
        }
        Update: {
          antes?: Json | null
          correlation_id?: string
          criado_em?: string
          depois?: Json | null
          entidade?: string
          evento?: string
          id?: string
          id_entidade?: string | null
          id_organizacao?: string | null
          id_usuario?: string | null
          metadados?: Json
          origem?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_auditoria_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_webhook: {
        Row: {
          atualizado_em: string
          correlation_id: string
          criado_em: string
          entidade_id: string | null
          entidade_tipo: string | null
          entregue_em: string | null
          evento: string
          id: string
          id_organizacao: string
          id_webhook: string
          payload_hash: string
          payload_ref: Json
          proxima_tentativa: string | null
          resposta_hash: string | null
          status: string
          status_http: number | null
          tentativa: number
        }
        Insert: {
          atualizado_em?: string
          correlation_id?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          entregue_em?: string | null
          evento: string
          id?: string
          id_organizacao: string
          id_webhook: string
          payload_hash: string
          payload_ref?: Json
          proxima_tentativa?: string | null
          resposta_hash?: string | null
          status?: string
          status_http?: number | null
          tentativa?: number
        }
        Update: {
          atualizado_em?: string
          correlation_id?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          entregue_em?: string | null
          evento?: string
          id?: string
          id_organizacao?: string
          id_webhook?: string
          payload_hash?: string
          payload_ref?: Json
          proxima_tentativa?: string | null
          resposta_hash?: string | null
          status?: string
          status_http?: number | null
          tentativa?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_webhook_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_webhook_id_webhook_fkey"
            columns: ["id_webhook"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      evidencias_resultado: {
        Row: {
          criado_em: string
          hash: string | null
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_resultado: string
          id_versao_documento: string | null
          pagina: number | null
          referencia_externa: string | null
          tipo_evidencia: string
          trecho: string | null
        }
        Insert: {
          criado_em?: string
          hash?: string | null
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_resultado: string
          id_versao_documento?: string | null
          pagina?: number | null
          referencia_externa?: string | null
          tipo_evidencia?: string
          trecho?: string | null
        }
        Update: {
          criado_em?: string
          hash?: string | null
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          id_resultado?: string
          id_versao_documento?: string | null
          pagina?: number | null
          referencia_externa?: string | null
          tipo_evidencia?: string
          trecho?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_resultado_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_resultado_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_resultado_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_resultado_id_resultado_fkey"
            columns: ["id_resultado"]
            isOneToOne: false
            referencedRelation: "resultados_requisitos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_resultado_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_461864e801b2"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      excecoes_controle: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string
          criado_por: string | null
          escopo: Json
          fim: string
          id: string
          id_controle: string
          id_organizacao: string
          inicio: string
          motivo: string
          status: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          escopo?: Json
          fim: string
          id?: string
          id_controle: string
          id_organizacao: string
          inicio: string
          motivo: string
          status?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          escopo?: Json
          fim?: string
          id?: string
          id_controle?: string
          id_organizacao?: string
          inicio?: string
          motivo?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "excecoes_controle_id_controle_fkey"
            columns: ["id_controle"]
            isOneToOne: false
            referencedRelation: "controles_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_controle_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      execucoes_analise: {
        Row: {
          concluida_em: string | null
          criado_em: string
          erro_codigo: string | null
          erro_detalhe: string | null
          hash_entrada: string | null
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          iniciada_em: string | null
          iniciada_por: string | null
          metadados: Json
          modelo: string | null
          motor: string
          prompt_versao: string | null
          provedor: string | null
          requisitos_afetados: string[]
          snapshot_entrada: Json
          status: string
          tipo: string
          versao_motor: string
        }
        Insert: {
          concluida_em?: string | null
          criado_em?: string
          erro_codigo?: string | null
          erro_detalhe?: string | null
          hash_entrada?: string | null
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          iniciada_em?: string | null
          iniciada_por?: string | null
          metadados?: Json
          modelo?: string | null
          motor?: string
          prompt_versao?: string | null
          provedor?: string | null
          requisitos_afetados?: string[]
          snapshot_entrada?: Json
          status?: string
          tipo?: string
          versao_motor?: string
        }
        Update: {
          concluida_em?: string | null
          criado_em?: string
          erro_codigo?: string | null
          erro_detalhe?: string | null
          hash_entrada?: string | null
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          iniciada_em?: string | null
          iniciada_por?: string | null
          metadados?: Json
          modelo?: string | null
          motor?: string
          prompt_versao?: string | null
          provedor?: string | null
          requisitos_afetados?: string[]
          snapshot_entrada?: Json
          status?: string
          tipo?: string
          versao_motor?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_analise_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_analise_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_analise_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_38ba969f0f82"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      execucoes_assincronas: {
        Row: {
          atualizado_em: string
          chave_idempotencia: string | null
          concluido_em: string | null
          correlation_id: string
          criado_em: string
          entidade_id: string | null
          entidade_tipo: string | null
          erro_codigo: string | null
          erro_detalhe: string | null
          fila: string
          id: string
          id_contrato: string | null
          id_organizacao: string | null
          iniciado_em: string | null
          message_id: number | null
          metadados: Json
          status: string
          tentativas: number
        }
        Insert: {
          atualizado_em?: string
          chave_idempotencia?: string | null
          concluido_em?: string | null
          correlation_id?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          erro_codigo?: string | null
          erro_detalhe?: string | null
          fila: string
          id?: string
          id_contrato?: string | null
          id_organizacao?: string | null
          iniciado_em?: string | null
          message_id?: number | null
          metadados?: Json
          status?: string
          tentativas?: number
        }
        Update: {
          atualizado_em?: string
          chave_idempotencia?: string | null
          concluido_em?: string | null
          correlation_id?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          erro_codigo?: string | null
          erro_detalhe?: string | null
          fila?: string
          id?: string
          id_contrato?: string | null
          id_organizacao?: string | null
          iniciado_em?: string | null
          message_id?: number | null
          metadados?: Json
          status?: string
          tentativas?: number
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_assincronas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_assincronas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_bdd47672c88e"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      execucoes_controle: {
        Row: {
          chave_idempotencia: string | null
          criado_em: string
          escopo: Json
          evento: string | null
          evento_id: string | null
          evidencias: Json
          executado_em: string
          executado_por: string | null
          id: string
          id_competencia: string | null
          id_contrato: string | null
          id_controle_versao: string
          id_entidade_organizacional: string | null
          id_organizacao: string
          periodo_fim: string | null
          periodo_inicio: string | null
          resultado: string
        }
        Insert: {
          chave_idempotencia?: string | null
          criado_em?: string
          escopo?: Json
          evento?: string | null
          evento_id?: string | null
          evidencias?: Json
          executado_em?: string
          executado_por?: string | null
          id?: string
          id_competencia?: string | null
          id_contrato?: string | null
          id_controle_versao: string
          id_entidade_organizacional?: string | null
          id_organizacao: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          resultado: string
        }
        Update: {
          chave_idempotencia?: string | null
          criado_em?: string
          escopo?: Json
          evento?: string | null
          evento_id?: string | null
          evidencias?: Json
          executado_em?: string
          executado_por?: string | null
          id?: string
          id_competencia?: string | null
          id_contrato?: string | null
          id_controle_versao?: string
          id_entidade_organizacional?: string | null
          id_organizacao?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_controle_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_controle_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_controle_id_controle_versao_fkey"
            columns: ["id_controle_versao"]
            isOneToOne: false
            referencedRelation: "versoes_controle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_controle_id_entidade_organizacional_fkey"
            columns: ["id_entidade_organizacional"]
            isOneToOne: false
            referencedRelation: "entidades_organizacionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_controle_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_42931947f7a7"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      exportacoes_evidencias: {
        Row: {
          exportado_em: string
          exportado_por: string | null
          formato: string
          hash: string
          id: string
          id_arquivo: string | null
          id_organizacao: string
          id_pacote: string
          metadados: Json
          tamanho: number | null
        }
        Insert: {
          exportado_em?: string
          exportado_por?: string | null
          formato: string
          hash: string
          id?: string
          id_arquivo?: string | null
          id_organizacao: string
          id_pacote: string
          metadados?: Json
          tamanho?: number | null
        }
        Update: {
          exportado_em?: string
          exportado_por?: string | null
          formato?: string
          hash?: string
          id?: string
          id_arquivo?: string | null
          id_organizacao?: string
          id_pacote?: string
          metadados?: Json
          tamanho?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exportacoes_evidencias_id_arquivo_fkey"
            columns: ["id_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exportacoes_evidencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exportacoes_evidencias_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_evidencias"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_financeiras: {
        Row: {
          ativa: boolean
          atualizado_em: string
          configuracao_ref: string | null
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          nome: string
          tipo: string
          versao_registro: number
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          configuracao_ref?: string | null
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          nome: string
          tipo: string
          versao_registro?: number
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          configuracao_ref?: string | null
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          nome?: string
          tipo?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_a6410848ca7d"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "fontes_financeiras_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_financeiras_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_formais_regras_preventivas: {
        Row: {
          criado_em: string
          fundamento_aplicabilidade: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_regra_preventiva: string
          id_versao_fonte_normativa: string
          validado_em: string
          validado_por: string | null
        }
        Insert: {
          criado_em?: string
          fundamento_aplicabilidade: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_regra_preventiva: string
          id_versao_fonte_normativa: string
          validado_em?: string
          validado_por?: string | null
        }
        Update: {
          criado_em?: string
          fundamento_aplicabilidade?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_regra_preventiva?: string
          id_versao_fonte_normativa?: string
          validado_em?: string
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c4da51cf0daf"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "fontes_formais_regras_preventiva_id_versao_fonte_normativa_fkey"
            columns: ["id_versao_fonte_normativa"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_formais_regras_preventivas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_formais_regras_preventivas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_formais_regras_preventivas_id_regra_preventiva_fkey"
            columns: ["id_regra_preventiva"]
            isOneToOne: false
            referencedRelation: "regras_preventivas"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_normativas: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string | null
          id: string
          id_contrato: string | null
          id_organizacao: string
          referencia: string | null
          situacao: string
          tipo: string
          titulo: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          referencia?: string | null
          situacao?: string
          tipo: string
          titulo: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          referencia?: string | null
          situacao?: string
          tipo?: string
          titulo?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_42fecbb1eb33"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "fontes_normativas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_normativas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_resposta_copiloto: {
        Row: {
          criado_em: string
          fonte_id: string | null
          fonte_tipo: string
          id: string
          id_contrato: string | null
          id_mensagem: string
          id_organizacao: string
          id_versao_documento: string | null
          metadados: Json
          pagina: number | null
          score: number | null
          trecho: string | null
        }
        Insert: {
          criado_em?: string
          fonte_id?: string | null
          fonte_tipo: string
          id?: string
          id_contrato?: string | null
          id_mensagem: string
          id_organizacao: string
          id_versao_documento?: string | null
          metadados?: Json
          pagina?: number | null
          score?: number | null
          trecho?: string | null
        }
        Update: {
          criado_em?: string
          fonte_id?: string | null
          fonte_tipo?: string
          id?: string
          id_contrato?: string | null
          id_mensagem?: string
          id_organizacao?: string
          id_versao_documento?: string | null
          metadados?: Json
          pagina?: number | null
          score?: number | null
          trecho?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c8f052cfb121"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "fontes_resposta_copiloto_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_resposta_copiloto_id_mensagem_fkey"
            columns: ["id_mensagem"]
            isOneToOne: false
            referencedRelation: "mensagens_copiloto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_resposta_copiloto_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_resposta_copiloto_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          atualizado_em: string
          criado_em: string
          documento: string | null
          id: string
          id_organizacao: string
          metadados: Json
          nome_fantasia: string | null
          nome_razao_social: string
          risco_documental: string
          status: string
          tipo: string | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          documento?: string | null
          id?: string
          id_organizacao: string
          metadados?: Json
          nome_fantasia?: string | null
          nome_razao_social: string
          risco_documental?: string
          status?: string
          tipo?: string | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          documento?: string | null
          id?: string
          id_organizacao?: string
          metadados?: Json
          nome_fantasia?: string | null
          nome_razao_social?: string
          risco_documental?: string
          status?: string
          tipo?: string | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      fragmentos_documento: {
        Row: {
          criado_em: string
          embedding: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          indice_fragmento: number
          metadados: Json
          modelo_embedding: string | null
          pagina_fim: number | null
          pagina_inicio: number | null
          texto: string
        }
        Insert: {
          criado_em?: string
          embedding?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          indice_fragmento: number
          metadados?: Json
          modelo_embedding?: string | null
          pagina_fim?: number | null
          pagina_inicio?: number | null
          texto: string
        }
        Update: {
          criado_em?: string
          embedding?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_documento?: string
          indice_fragmento?: number
          metadados?: Json
          modelo_embedding?: string | null
          pagina_fim?: number | null
          pagina_inicio?: number | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c976e852cdfb"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "fragmentos_documento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragmentos_documento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragmentos_documento_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      importacoes_financeiras: {
        Row: {
          chave_deduplicacao: string
          concluido_em: string | null
          criado_em: string
          criado_por: string | null
          erro_detalhe: string | null
          hash: string
          id: string
          id_arquivo: string | null
          id_contrato: string
          id_fonte: string
          id_organizacao: string
          iniciado_em: string | null
          status: string
          total_importado: number
          total_registros: number
          total_rejeitado: number
        }
        Insert: {
          chave_deduplicacao: string
          concluido_em?: string | null
          criado_em?: string
          criado_por?: string | null
          erro_detalhe?: string | null
          hash: string
          id?: string
          id_arquivo?: string | null
          id_contrato: string
          id_fonte: string
          id_organizacao: string
          iniciado_em?: string | null
          status?: string
          total_importado?: number
          total_registros?: number
          total_rejeitado?: number
        }
        Update: {
          chave_deduplicacao?: string
          concluido_em?: string | null
          criado_em?: string
          criado_por?: string | null
          erro_detalhe?: string | null
          hash?: string
          id?: string
          id_arquivo?: string | null
          id_contrato?: string
          id_fonte?: string
          id_organizacao?: string
          iniciado_em?: string | null
          status?: string
          total_importado?: number
          total_registros?: number
          total_rejeitado?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_a8e13aa7f1ab"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "importacoes_financeiras_arquivo_org_contrato_fk"
            columns: ["id_arquivo", "id_organizacao", "id_contrato"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao", "id_contrato"]
          },
          {
            foreignKeyName: "importacoes_financeiras_arquivo_org_fk"
            columns: ["id_arquivo", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "importacoes_financeiras_id_arquivo_fkey"
            columns: ["id_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "importacoes_financeiras_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "importacoes_financeiras_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fontes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "importacoes_financeiras_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_lista: {
        Row: {
          aplicavel: boolean
          categoria: string | null
          codigo: string
          criado_em: string
          criticidade: string
          descricao: string
          id: string
          id_contrato: string
          id_fonte_versao: string | null
          id_organizacao: string
          id_versao_lista: string
          impeditivo: boolean
          obrigatorio: boolean
          ordem: number
          regra_validacao: Json
        }
        Insert: {
          aplicavel?: boolean
          categoria?: string | null
          codigo: string
          criado_em?: string
          criticidade?: string
          descricao: string
          id?: string
          id_contrato: string
          id_fonte_versao?: string | null
          id_organizacao: string
          id_versao_lista: string
          impeditivo?: boolean
          obrigatorio?: boolean
          ordem?: number
          regra_validacao?: Json
        }
        Update: {
          aplicavel?: boolean
          categoria?: string | null
          codigo?: string
          criado_em?: string
          criticidade?: string
          descricao?: string
          id?: string
          id_contrato?: string
          id_fonte_versao?: string | null
          id_organizacao?: string
          id_versao_lista?: string
          impeditivo?: boolean
          obrigatorio?: boolean
          ordem?: number
          regra_validacao?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_2e46682d56b5"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "itens_lista_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_lista_id_fonte_versao_fkey"
            columns: ["id_fonte_versao"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_lista_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_lista_id_versao_lista_fkey"
            columns: ["id_versao_lista"]
            isOneToOne: false
            referencedRelation: "versoes_lista"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pacote_competencia: {
        Row: {
          criado_em: string
          entidade_id: string
          entidade_tipo: string
          hash: string
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_pacote: string
          metadados: Json
          ordem: number
          versao_id: string | null
        }
        Insert: {
          criado_em?: string
          entidade_id: string
          entidade_tipo: string
          hash: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          id_pacote: string
          metadados?: Json
          ordem?: number
          versao_id?: string | null
        }
        Update: {
          criado_em?: string
          entidade_id?: string
          entidade_tipo?: string
          hash?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          id_pacote?: string
          metadados?: Json
          ordem?: number
          versao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_d0648ca1abf3"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "itens_pacote_competencia_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pacote_competencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pacote_competencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pacote_competencia_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_competencia"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pacote_evidencias: {
        Row: {
          criado_em: string
          entidade_id: string | null
          entidade_tipo: string
          hash: string
          id: string
          id_organizacao: string
          id_pacote: string
          metadados: Json
          ordem: number
          versao_id: string | null
        }
        Insert: {
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo: string
          hash: string
          id?: string
          id_organizacao: string
          id_pacote: string
          metadados?: Json
          ordem?: number
          versao_id?: string | null
        }
        Update: {
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string
          hash?: string
          id?: string
          id_organizacao?: string
          id_pacote?: string
          metadados?: Json
          ordem?: number
          versao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_pacote_evidencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pacote_evidencias_id_pacote_fkey"
            columns: ["id_pacote"]
            isOneToOne: false
            referencedRelation: "pacotes_evidencias"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs_dlq: {
        Row: {
          correlation_id: string | null
          erro_codigo: string | null
          erro_detalhe: string | null
          fila: string
          id: string
          id_contrato: string | null
          id_execucao: string | null
          id_organizacao: string | null
          message_id: number
          movido_em: string
          payload: Json
          tentativas: number
        }
        Insert: {
          correlation_id?: string | null
          erro_codigo?: string | null
          erro_detalhe?: string | null
          fila: string
          id?: string
          id_contrato?: string | null
          id_execucao?: string | null
          id_organizacao?: string | null
          message_id: number
          movido_em?: string
          payload?: Json
          tentativas: number
        }
        Update: {
          correlation_id?: string | null
          erro_codigo?: string | null
          erro_detalhe?: string | null
          fila?: string
          id?: string
          id_contrato?: string | null
          id_execucao?: string | null
          id_organizacao?: string | null
          message_id?: number
          movido_em?: string
          payload?: Json
          tentativas?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_5baa29390a9b"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "jobs_dlq_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_dlq_id_execucao_fkey"
            columns: ["id_execucao"]
            isOneToOne: false
            referencedRelation: "execucoes_assincronas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_dlq_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      linhas_orcamentarias: {
        Row: {
          codigo: string
          criado_em: string
          descricao: string
          grupo: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          id_versao_proposta: string
          limite_remanejamento_percentual: number | null
          metadados: Json
          quantidade: number
          rubrica: string | null
          subrubrica: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          codigo: string
          criado_em?: string
          descricao: string
          grupo?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          id_versao_proposta: string
          limite_remanejamento_percentual?: number | null
          metadados?: Json
          quantidade?: number
          rubrica?: string | null
          subrubrica?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          codigo?: string
          criado_em?: string
          descricao?: string
          grupo?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_proposta?: string
          limite_remanejamento_percentual?: number | null
          metadados?: Json
          quantidade?: number
          rubrica?: string | null
          subrubrica?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_bca4f432d115"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "linhas_orcamentarias_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linhas_orcamentarias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linhas_orcamentarias_id_versao_proposta_fkey"
            columns: ["id_versao_proposta"]
            isOneToOne: false
            referencedRelation: "versoes_proposta"
            referencedColumns: ["id"]
          },
        ]
      }
      listas_verificacao: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          nome: string
          situacao: string
          versao_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          nome: string
          situacao?: string
          versao_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          nome?: string
          situacao?: string
          versao_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_92805443d3d4"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "listas_verificacao_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listas_verificacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      mapas_evidencias_contestacao: {
        Row: {
          criado_em: string
          descricao: string | null
          hash: string | null
          id: string
          id_competencia: string
          id_contestacao: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string | null
          pagina: number | null
          trecho: string | null
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          hash?: string | null
          id?: string
          id_competencia: string
          id_contestacao: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento?: string | null
          pagina?: number | null
          trecho?: string | null
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          hash?: string | null
          id?: string
          id_competencia?: string
          id_contestacao?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_documento?: string | null
          pagina?: number | null
          trecho?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_4999cf677618"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "mapas_evidencias_contestacao_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapas_evidencias_contestacao_id_contestacao_fkey"
            columns: ["id_contestacao"]
            isOneToOne: false
            referencedRelation: "contestacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapas_evidencias_contestacao_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapas_evidencias_contestacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapas_evidencias_contestacao_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_copiloto: {
        Row: {
          conteudo: string
          criado_em: string
          criado_por: string | null
          id: string
          id_consulta_semantica: string | null
          id_contrato: string | null
          id_organizacao: string
          id_retorno_modelo: string | null
          id_sessao: string
          papel: string
        }
        Insert: {
          conteudo: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_consulta_semantica?: string | null
          id_contrato?: string | null
          id_organizacao: string
          id_retorno_modelo?: string | null
          id_sessao: string
          papel: string
        }
        Update: {
          conteudo?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          id_consulta_semantica?: string | null
          id_contrato?: string | null
          id_organizacao?: string
          id_retorno_modelo?: string | null
          id_sessao?: string
          papel?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_bc4747d38069"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "mensagens_copiloto_id_consulta_semantica_fkey"
            columns: ["id_consulta_semantica"]
            isOneToOne: false
            referencedRelation: "consultas_semanticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_copiloto_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_copiloto_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_copiloto_id_retorno_modelo_fkey"
            columns: ["id_retorno_modelo"]
            isOneToOne: false
            referencedRelation: "retornos_modelo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_copiloto_id_sessao_fkey"
            columns: ["id_sessao"]
            isOneToOne: false
            referencedRelation: "sessoes_copiloto"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas_historicas: {
        Row: {
          calculado_em: string
          criado_em: string
          dimensoes: Json
          id: string
          id_contratante: string | null
          id_contrato: string | null
          id_organizacao: string
          metrica: string
          periodo_fim: string | null
          periodo_inicio: string | null
          valor_numeric: number | null
          valor_texto: string | null
        }
        Insert: {
          calculado_em?: string
          criado_em?: string
          dimensoes?: Json
          id?: string
          id_contratante?: string | null
          id_contrato?: string | null
          id_organizacao: string
          metrica: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          valor_numeric?: number | null
          valor_texto?: string | null
        }
        Update: {
          calculado_em?: string
          criado_em?: string
          dimensoes?: Json
          id?: string
          id_contratante?: string | null
          id_contrato?: string | null
          id_organizacao?: string
          metrica?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          valor_numeric?: number | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_ad2250ae2f0a"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "metricas_historicas_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_historicas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_historicas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      nao_conformidades: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          descricao: string
          id: string
          id_competencia: string | null
          id_contrato: string | null
          id_controle: string | null
          id_entidade_organizacional: string | null
          id_execucao_controle: string | null
          id_organizacao: string
          origem_evento: string | null
          origem_evento_id: string | null
          prazo: string | null
          responsavel: string | null
          risco: string | null
          severidade: string
          status: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao: string
          id?: string
          id_competencia?: string | null
          id_contrato?: string | null
          id_controle?: string | null
          id_entidade_organizacional?: string | null
          id_execucao_controle?: string | null
          id_organizacao: string
          origem_evento?: string | null
          origem_evento_id?: string | null
          prazo?: string | null
          responsavel?: string | null
          risco?: string | null
          severidade?: string
          status?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string
          id?: string
          id_competencia?: string | null
          id_contrato?: string | null
          id_controle?: string | null
          id_entidade_organizacional?: string | null
          id_execucao_controle?: string | null
          id_organizacao?: string
          origem_evento?: string | null
          origem_evento_id?: string | null
          prazo?: string | null
          responsavel?: string | null
          risco?: string | null
          severidade?: string
          status?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_71ca9c48f3d9"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "nao_conformidades_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_id_controle_fkey"
            columns: ["id_controle"]
            isOneToOne: false
            referencedRelation: "controles_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_id_entidade_organizacional_fkey"
            columns: ["id_entidade_organizacional"]
            isOneToOne: false
            referencedRelation: "entidades_organizacionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_id_execucao_controle_fkey"
            columns: ["id_execucao_controle"]
            isOneToOne: false
            referencedRelation: "execucoes_controle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          canal: string
          criado_em: string
          entidade_id: string | null
          entidade_tipo: string | null
          enviada_em: string | null
          erro: string | null
          evento: string
          id: string
          id_organizacao: string
          id_usuario: string
          lida_em: string | null
          mensagem: string
          status: string
          titulo: string
        }
        Insert: {
          canal: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          enviada_em?: string | null
          erro?: string | null
          evento: string
          id?: string
          id_organizacao: string
          id_usuario: string
          lida_em?: string | null
          mensagem: string
          status?: string
          titulo: string
        }
        Update: {
          canal?: string
          criado_em?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          enviada_em?: string | null
          erro?: string | null
          evento?: string
          id?: string
          id_organizacao?: string
          id_usuario?: string
          lida_em?: string | null
          mensagem?: string
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          atualizado_em: string
          cnpj: string | null
          criado_em: string
          id: string
          idioma: string
          moeda: string
          nome_fantasia: string | null
          razao_social: string
          situacao: string
          timezone: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          cnpj?: string | null
          criado_em?: string
          id?: string
          idioma?: string
          moeda?: string
          nome_fantasia?: string | null
          razao_social: string
          situacao?: string
          timezone?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          cnpj?: string | null
          criado_em?: string
          id?: string
          idioma?: string
          moeda?: string
          nome_fantasia?: string | null
          razao_social?: string
          situacao?: string
          timezone?: string
          versao_registro?: number
        }
        Relationships: []
      }
      pacotes_competencia: {
        Row: {
          congelado_em: string | null
          criado_em: string
          criado_por: string | null
          hash_pacote: string
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero: number
          status: string
          tipo: string
        }
        Insert: {
          congelado_em?: string | null
          criado_em?: string
          criado_por?: string | null
          hash_pacote: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero: number
          status?: string
          tipo?: string
        }
        Update: {
          congelado_em?: string | null
          criado_em?: string
          criado_por?: string | null
          hash_pacote?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          numero?: number
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_4e448213bdce"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pacotes_competencia_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_competencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_competencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes_evidencias: {
        Row: {
          atualizado_em: string
          congelado_em: string | null
          criado_em: string
          criado_por: string | null
          escopo: Json
          expira_em: string | null
          hash: string | null
          id: string
          id_arquivo_exportacao: string | null
          id_contrato: string | null
          id_organizacao: string
          status: string
        }
        Insert: {
          atualizado_em?: string
          congelado_em?: string | null
          criado_em?: string
          criado_por?: string | null
          escopo: Json
          expira_em?: string | null
          hash?: string | null
          id?: string
          id_arquivo_exportacao?: string | null
          id_contrato?: string | null
          id_organizacao: string
          status?: string
        }
        Update: {
          atualizado_em?: string
          congelado_em?: string | null
          criado_em?: string
          criado_por?: string | null
          escopo?: Json
          expira_em?: string | null
          hash?: string | null
          id?: string
          id_arquivo_exportacao?: string | null
          id_contrato?: string | null
          id_organizacao?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_a9dd9d46c92c"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pacotes_evidencias_id_arquivo_exportacao_fkey"
            columns: ["id_arquivo_exportacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_evidencias_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_evidencias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes_reapresentacao: {
        Row: {
          congelado_em: string
          criado_em: string
          criado_por: string | null
          hash: string
          id: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero: number
          reapresentado_em: string | null
          snapshot: Json
        }
        Insert: {
          congelado_em?: string
          criado_em?: string
          criado_por?: string | null
          hash: string
          id?: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero: number
          reapresentado_em?: string | null
          snapshot?: Json
        }
        Update: {
          congelado_em?: string
          criado_em?: string
          criado_por?: string | null
          hash?: string
          id?: string
          id_ciclo?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          numero?: number
          reapresentado_em?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_4a5e3c2ad8e2"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pacotes_reapresentacao_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_reapresentacao_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_reapresentacao_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_reapresentacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      padroes_historicos: {
        Row: {
          confianca: number | null
          criado_em: string
          descricao: string
          evidencias: Json
          id: string
          id_contratante: string
          id_organizacao: string
          status: string
          tipo: string
        }
        Insert: {
          confianca?: number | null
          criado_em?: string
          descricao: string
          evidencias?: Json
          id?: string
          id_contratante: string
          id_organizacao: string
          status?: string
          tipo: string
        }
        Update: {
          confianca?: number | null
          criado_em?: string
          descricao?: string
          evidencias?: Json
          id?: string
          id_contratante?: string
          id_organizacao?: string
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "padroes_historicos_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "padroes_historicos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      paginas_documento: {
        Row: {
          criado_em: string
          hash_texto: string | null
          id: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          metadados: Json
          numero_pagina: number
          texto_extraido: string | null
        }
        Insert: {
          criado_em?: string
          hash_texto?: string | null
          id?: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          metadados?: Json
          numero_pagina: number
          texto_extraido?: string | null
        }
        Update: {
          criado_em?: string
          hash_texto?: string | null
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_documento?: string
          metadados?: Json
          numero_pagina?: number
          texto_extraido?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_82c699878dfa"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "paginas_documento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paginas_documento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paginas_documento_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      pareceres_contratante: {
        Row: {
          criado_em: string
          data_emissao: string | null
          id: string
          id_apresentacao: string | null
          id_arquivo: string
          id_ciclo: string | null
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero_documento: string | null
          parecer_final_favoravel: boolean
          recebido_em: string
          registrado_por: string | null
          resultado_geral: string | null
        }
        Insert: {
          criado_em?: string
          data_emissao?: string | null
          id?: string
          id_apresentacao?: string | null
          id_arquivo: string
          id_ciclo?: string | null
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          numero_documento?: string | null
          parecer_final_favoravel?: boolean
          recebido_em?: string
          registrado_por?: string | null
          resultado_geral?: string | null
        }
        Update: {
          criado_em?: string
          data_emissao?: string | null
          id?: string
          id_apresentacao?: string | null
          id_arquivo?: string
          id_ciclo?: string | null
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          numero_documento?: string | null
          parecer_final_favoravel?: boolean
          recebido_em?: string
          registrado_por?: string | null
          resultado_geral?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_9c5e3ebcf137"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pareceres_contratante_arquivo_org_contrato_fk"
            columns: ["id_arquivo", "id_organizacao", "id_contrato"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao", "id_contrato"]
          },
          {
            foreignKeyName: "pareceres_contratante_arquivo_org_fk"
            columns: ["id_arquivo", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_apresentacao_fkey"
            columns: ["id_apresentacao"]
            isOneToOne: false
            referencedRelation: "apresentacoes_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_arquivo_fkey"
            columns: ["id_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_contratante_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pareceres_internos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          autor: string | null
          criado_em: string
          hash: string
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          status: string
          texto: string
          versao: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          autor?: string | null
          criado_em?: string
          hash: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          status?: string
          texto: string
          versao: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          autor?: string | null
          criado_em?: string
          hash?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          status?: string
          texto?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_ed8c738d3f94"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pareceres_internos_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_internos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_internos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_contratante: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          id_contratante: string
          id_organizacao: string
          metricas: Json
          padroes: Json
          resumo: string | null
          versao: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contratante: string
          id_organizacao: string
          metricas?: Json
          padroes?: Json
          resumo?: string | null
          versao: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contratante?: string
          id_organizacao?: string
          metricas?: Json
          padroes?: Json
          resumo?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "perfis_contratante_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_contratante_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_usuarios: {
        Row: {
          codigo: string
          criado_em: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          codigo: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          codigo?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      planos_acao: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string | null
          id: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          responsavel: string | null
          status: string
          titulo: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          responsavel?: string | null
          status?: string
          titulo: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          id_ciclo?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          responsavel?: string | null
          status?: string
          titulo?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_f9f51fa89155"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "planos_acao_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_remediacao: {
        Row: {
          acoes: Json
          atualizado_em: string
          concluido_em: string | null
          concluido_por: string | null
          criado_em: string
          criado_por: string | null
          evidencias: Json
          id: string
          id_nao_conformidade: string
          id_organizacao: string
          prazo: string | null
          responsavel: string | null
          status: string
          validado_em: string | null
          validado_por: string | null
          versao_registro: number
        }
        Insert: {
          acoes: Json
          atualizado_em?: string
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          criado_por?: string | null
          evidencias?: Json
          id?: string
          id_nao_conformidade: string
          id_organizacao: string
          prazo?: string | null
          responsavel?: string | null
          status?: string
          validado_em?: string | null
          validado_por?: string | null
          versao_registro?: number
        }
        Update: {
          acoes?: Json
          atualizado_em?: string
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          criado_por?: string | null
          evidencias?: Json
          id?: string
          id_nao_conformidade?: string
          id_organizacao?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string
          validado_em?: string | null
          validado_por?: string | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "planos_remediacao_id_nao_conformidade_fkey"
            columns: ["id_nao_conformidade"]
            isOneToOne: false
            referencedRelation: "nao_conformidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_remediacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pontuacoes_risco: {
        Row: {
          criado_em: string
          entidade_id: string
          entidade_tipo: string
          explicacao: string | null
          fatores: Json
          fontes: Json
          id: string
          id_contrato: string | null
          id_organizacao: string
          modelo_versao: string
          score: number
        }
        Insert: {
          criado_em?: string
          entidade_id: string
          entidade_tipo: string
          explicacao?: string | null
          fatores?: Json
          fontes?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          modelo_versao: string
          score: number
        }
        Update: {
          criado_em?: string
          entidade_id?: string
          entidade_tipo?: string
          explicacao?: string | null
          fatores?: Json
          fontes?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          modelo_versao?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_a3482f3def11"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "pontuacoes_risco_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_risco_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      precedentes: {
        Row: {
          categoria: string | null
          competencia_origem: string | null
          confianca: number | null
          confirmacoes: number
          criado_em: string
          desfecho: string | null
          documento_tipo: string | null
          embedding: string | null
          escopo_aplicacao: string
          fonte_id: string | null
          fonte_tipo: string
          forca_score: number | null
          hierarquia_normativa: number
          id: string
          id_apontamento_historico: string | null
          id_contratante: string
          id_contrato_origem: string
          id_organizacao: string
          id_relatorio_origem: string | null
          item_origem: string | null
          problema: string
          revisado_em: string | null
          revisado_por_humano: boolean
          rubrica: string | null
          solucao: string | null
          status: string
          titulo: string | null
          ultima_confirmacao_em: string | null
          unidade_origem: string | null
          valor_referencia: number | null
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          categoria?: string | null
          competencia_origem?: string | null
          confianca?: number | null
          confirmacoes?: number
          criado_em?: string
          desfecho?: string | null
          documento_tipo?: string | null
          embedding?: string | null
          escopo_aplicacao?: string
          fonte_id?: string | null
          fonte_tipo?: string
          forca_score?: number | null
          hierarquia_normativa?: number
          id?: string
          id_apontamento_historico?: string | null
          id_contratante: string
          id_contrato_origem: string
          id_organizacao: string
          id_relatorio_origem?: string | null
          item_origem?: string | null
          problema: string
          revisado_em?: string | null
          revisado_por_humano?: boolean
          rubrica?: string | null
          solucao?: string | null
          status?: string
          titulo?: string | null
          ultima_confirmacao_em?: string | null
          unidade_origem?: string | null
          valor_referencia?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          categoria?: string | null
          competencia_origem?: string | null
          confianca?: number | null
          confirmacoes?: number
          criado_em?: string
          desfecho?: string | null
          documento_tipo?: string | null
          embedding?: string | null
          escopo_aplicacao?: string
          fonte_id?: string | null
          fonte_tipo?: string
          forca_score?: number | null
          hierarquia_normativa?: number
          id?: string
          id_apontamento_historico?: string | null
          id_contratante?: string
          id_contrato_origem?: string
          id_organizacao?: string
          id_relatorio_origem?: string | null
          item_origem?: string | null
          problema?: string
          revisado_em?: string | null
          revisado_por_humano?: boolean
          rubrica?: string | null
          solucao?: string | null
          status?: string
          titulo?: string | null
          ultima_confirmacao_em?: string | null
          unidade_origem?: string | null
          valor_referencia?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precedentes_id_apontamento_historico_fkey"
            columns: ["id_apontamento_historico"]
            isOneToOne: false
            referencedRelation: "apontamentos_historicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precedentes_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precedentes_id_contrato_origem_fkey"
            columns: ["id_contrato_origem"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precedentes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precedentes_id_relatorio_origem_fkey"
            columns: ["id_relatorio_origem"]
            isOneToOne: false
            referencedRelation: "relatorios_historicos_contratante"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias_notificacao: {
        Row: {
          atualizado_em: string
          canal: string
          criado_em: string
          evento: string
          habilitado: boolean
          id: string
          id_organizacao: string
          id_usuario: string
        }
        Insert: {
          atualizado_em?: string
          canal?: string
          criado_em?: string
          evento: string
          habilitado?: boolean
          id?: string
          id_organizacao: string
          id_usuario: string
        }
        Update: {
          atualizado_em?: string
          canal?: string
          criado_em?: string
          evento?: string
          habilitado?: boolean
          id?: string
          id_organizacao?: string
          id_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_notificacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      processamentos_documento: {
        Row: {
          atualizado_em: string
          concluido_em: string | null
          criado_em: string
          erro_codigo: string | null
          erro_detalhe: string | null
          etapa: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          iniciado_em: string | null
          resultado: Json
          status: string
          tentativas: number
        }
        Insert: {
          atualizado_em?: string
          concluido_em?: string | null
          criado_em?: string
          erro_codigo?: string | null
          erro_detalhe?: string | null
          etapa: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento: string
          iniciado_em?: string | null
          resultado?: Json
          status?: string
          tentativas?: number
        }
        Update: {
          atualizado_em?: string
          concluido_em?: string | null
          criado_em?: string
          erro_codigo?: string | null
          erro_detalhe?: string | null
          etapa?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_documento?: string
          iniciado_em?: string | null
          resultado?: Json
          status?: string
          tentativas?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_137b2faddd38"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "processamentos_documento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processamentos_documento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processamentos_documento_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_orcamentarias: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          situacao: string
          titulo: string
          versao_atual: number
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          situacao?: string
          titulo: string
          versao_atual?: number
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          situacao?: string
          titulo?: string
          versao_atual?: number
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_493694679d99"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "propostas_orcamentarias_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_orcamentarias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      publicacoes_regras: {
        Row: {
          aprovado_em: string
          aprovado_por: string | null
          criado_em: string
          hash: string
          id: string
          id_avaliacao_impacto: string | null
          id_organizacao: string
          id_regra_candidata: string | null
          id_regra_preventiva: string | null
          status: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          aprovado_em?: string
          aprovado_por?: string | null
          criado_em?: string
          hash: string
          id?: string
          id_avaliacao_impacto?: string | null
          id_organizacao: string
          id_regra_candidata?: string | null
          id_regra_preventiva?: string | null
          status?: string
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          aprovado_em?: string
          aprovado_por?: string | null
          criado_em?: string
          hash?: string
          id?: string
          id_avaliacao_impacto?: string | null
          id_organizacao?: string
          id_regra_candidata?: string | null
          id_regra_preventiva?: string | null
          status?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicacoes_regras_id_avaliacao_impacto_fkey"
            columns: ["id_avaliacao_impacto"]
            isOneToOne: false
            referencedRelation: "avaliacoes_impacto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacoes_regras_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacoes_regras_id_regra_candidata_fkey"
            columns: ["id_regra_candidata"]
            isOneToOne: false
            referencedRelation: "regras_candidatas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacoes_regras_id_regra_preventiva_fkey"
            columns: ["id_regra_preventiva"]
            isOneToOne: false
            referencedRelation: "regras_preventivas"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_organizacao: {
        Row: {
          atualizado_em: string
          configuracao: Json
          criado_em: string
          habilitado: boolean
          id: string
          id_organizacao: string
          recurso: string
        }
        Insert: {
          atualizado_em?: string
          configuracao?: Json
          criado_em?: string
          habilitado?: boolean
          id?: string
          id_organizacao: string
          recurso: string
        }
        Update: {
          atualizado_em?: string
          configuracao?: Json
          criado_em?: string
          habilitado?: boolean
          id?: string
          id_organizacao?: string
          recurso?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_organizacao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_candidatas: {
        Row: {
          criado_em: string
          criado_por: string | null
          descricao: string
          efeito_proposto: string
          fonte: Json
          id: string
          id_contrato: string | null
          id_organizacao: string
          origem_id: string | null
          origem_tipo: string
          status: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          descricao: string
          efeito_proposto?: string
          fonte?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          origem_id?: string | null
          origem_tipo: string
          status?: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          descricao?: string
          efeito_proposto?: string
          fonte?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          origem_id?: string | null
          origem_tipo?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_2fb2d8385dc4"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "regras_candidatas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_candidatas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_conformidade: {
        Row: {
          atualizado_em: string
          codigo: string
          configuracao: Json
          criado_em: string
          descricao: string
          efeito_portao: boolean
          id: string
          id_contrato: string
          id_fonte_versao: string | null
          id_organizacao: string
          situacao: string
          tipo: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          codigo: string
          configuracao?: Json
          criado_em?: string
          descricao: string
          efeito_portao?: boolean
          id?: string
          id_contrato: string
          id_fonte_versao?: string | null
          id_organizacao: string
          situacao?: string
          tipo?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          codigo?: string
          configuracao?: Json
          criado_em?: string
          descricao?: string
          efeito_portao?: boolean
          id?: string
          id_contrato?: string
          id_fonte_versao?: string | null
          id_organizacao?: string
          situacao?: string
          tipo?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_6461b4f52634"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "regras_conformidade_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_conformidade_id_fonte_versao_fkey"
            columns: ["id_fonte_versao"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_conformidade_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_preventivas: {
        Row: {
          aprovada_em: string | null
          aprovada_por: string | null
          atualizado_em: string
          codigo_regra: string
          configuracao: Json
          criado_em: string
          criticidade: string
          descricao: string
          efeito: string
          escopo_aplicacao: string
          fonte: Json
          id: string
          id_contratante: string | null
          id_contrato: string | null
          id_fonte_formal_versao: string | null
          id_organizacao: string
          motivo: string | null
          numero_versao: number
          origem_precedente: string | null
          situacao: string
          tipo_contrato: string | null
          versao_registro: number
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          aprovada_em?: string | null
          aprovada_por?: string | null
          atualizado_em?: string
          codigo_regra: string
          configuracao?: Json
          criado_em?: string
          criticidade?: string
          descricao: string
          efeito?: string
          escopo_aplicacao?: string
          fonte?: Json
          id?: string
          id_contratante?: string | null
          id_contrato?: string | null
          id_fonte_formal_versao?: string | null
          id_organizacao: string
          motivo?: string | null
          numero_versao?: number
          origem_precedente?: string | null
          situacao?: string
          tipo_contrato?: string | null
          versao_registro?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          aprovada_em?: string | null
          aprovada_por?: string | null
          atualizado_em?: string
          codigo_regra?: string
          configuracao?: Json
          criado_em?: string
          criticidade?: string
          descricao?: string
          efeito?: string
          escopo_aplicacao?: string
          fonte?: Json
          id?: string
          id_contratante?: string | null
          id_contrato?: string | null
          id_fonte_formal_versao?: string | null
          id_organizacao?: string
          motivo?: string | null
          numero_versao?: number
          origem_precedente?: string | null
          situacao?: string
          tipo_contrato?: string | null
          versao_registro?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_9bf9f0551c2b"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "regras_preventivas_id_contratante_fkey"
            columns: ["id_contratante"]
            isOneToOne: false
            referencedRelation: "contratantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_preventivas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_preventivas_id_fonte_formal_versao_fkey"
            columns: ["id_fonte_formal_versao"]
            isOneToOne: false
            referencedRelation: "versoes_fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_preventivas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      relacionamentos_conhecimento: {
        Row: {
          criado_em: string
          destino_id: string
          destino_tipo: string
          id: string
          id_contrato: string | null
          id_organizacao: string
          metadados: Json
          origem_id: string
          origem_tipo: string
          peso: number | null
          relacao: string
        }
        Insert: {
          criado_em?: string
          destino_id: string
          destino_tipo: string
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          metadados?: Json
          origem_id: string
          origem_tipo: string
          peso?: number | null
          relacao: string
        }
        Update: {
          criado_em?: string
          destino_id?: string
          destino_tipo?: string
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          metadados?: Json
          origem_id?: string
          origem_tipo?: string
          peso?: number | null
          relacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_b2101dad71f6"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "relacionamentos_conhecimento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relacionamentos_conhecimento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_historicos_contratante: {
        Row: {
          competencia_referencia: string | null
          criado_em: string
          criado_por: string | null
          data_documento: string | null
          id: string
          id_arquivo: string
          id_contrato: string
          id_organizacao: string
          numero_documento: string | null
          origem_temporal: string
          resultado_geral: string | null
          status_processamento: string
          tipo: string
        }
        Insert: {
          competencia_referencia?: string | null
          criado_em?: string
          criado_por?: string | null
          data_documento?: string | null
          id?: string
          id_arquivo: string
          id_contrato: string
          id_organizacao: string
          numero_documento?: string | null
          origem_temporal?: string
          resultado_geral?: string | null
          status_processamento?: string
          tipo: string
        }
        Update: {
          competencia_referencia?: string | null
          criado_em?: string
          criado_por?: string | null
          data_documento?: string | null
          id?: string
          id_arquivo?: string
          id_contrato?: string
          id_organizacao?: string
          numero_documento?: string | null
          origem_temporal?: string
          resultado_geral?: string | null
          status_processamento?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_0e6eba3eaf06"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "relatorios_historicos_arquivo_org_contrato_fk"
            columns: ["id_arquivo", "id_organizacao", "id_contrato"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao", "id_contrato"]
          },
          {
            foreignKeyName: "relatorios_historicos_arquivo_org_fk"
            columns: ["id_arquivo", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "relatorios_historicos_contratante_id_arquivo_fkey"
            columns: ["id_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_historicos_contratante_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_historicos_contratante_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      requisitos_competencia: {
        Row: {
          aplicavel: boolean
          categoria: string | null
          codigo: string | null
          condicao_aplicabilidade: Json
          criado_em: string
          criticidade: string
          descricao: string
          efeito_portao: boolean
          fonte_detalhe: Json
          fonte_referencia: string | null
          fonte_tipo: string | null
          hash_snapshot: string
          id: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          impeditivo: boolean
          obrigatorio: boolean
          ordem: number
          origem_id: string | null
          origem_tipo: string
          origem_versao: string | null
          regra_validacao: Json
        }
        Insert: {
          aplicavel?: boolean
          categoria?: string | null
          codigo?: string | null
          condicao_aplicabilidade?: Json
          criado_em?: string
          criticidade?: string
          descricao: string
          efeito_portao?: boolean
          fonte_detalhe?: Json
          fonte_referencia?: string | null
          fonte_tipo?: string | null
          hash_snapshot: string
          id?: string
          id_competencia: string
          id_contrato: string
          id_organizacao: string
          impeditivo?: boolean
          obrigatorio?: boolean
          ordem?: number
          origem_id?: string | null
          origem_tipo: string
          origem_versao?: string | null
          regra_validacao?: Json
        }
        Update: {
          aplicavel?: boolean
          categoria?: string | null
          codigo?: string | null
          condicao_aplicabilidade?: Json
          criado_em?: string
          criticidade?: string
          descricao?: string
          efeito_portao?: boolean
          fonte_detalhe?: Json
          fonte_referencia?: string | null
          fonte_tipo?: string | null
          hash_snapshot?: string
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_organizacao?: string
          impeditivo?: boolean
          obrigatorio?: boolean
          ordem?: number
          origem_id?: string | null
          origem_tipo?: string
          origem_versao?: string | null
          regra_validacao?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c2318f552948"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "requisitos_competencia_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_competencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_competencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_historicas: {
        Row: {
          criado_em: string
          id: string
          id_apontamento: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento_resposta: string | null
          texto: string
        }
        Insert: {
          criado_em?: string
          id?: string
          id_apontamento: string
          id_contrato: string
          id_organizacao: string
          id_versao_documento_resposta?: string | null
          texto: string
        }
        Update: {
          criado_em?: string
          id?: string
          id_apontamento?: string
          id_contrato?: string
          id_organizacao?: string
          id_versao_documento_resposta?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_7b465a594c59"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "respostas_historicas_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_historicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_historicas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_historicas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_historicas_id_versao_documento_resposta_fkey"
            columns: ["id_versao_documento_resposta"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados_requisitos: {
        Row: {
          confianca: number | null
          criado_em: string
          fundamento: string | null
          hash_evidencias: string | null
          id: string
          id_competencia: string
          id_contrato: string
          id_execucao: string
          id_organizacao: string
          id_requisito: string
          justificativa: string | null
          metadados: Json
          resultado: string
        }
        Insert: {
          confianca?: number | null
          criado_em?: string
          fundamento?: string | null
          hash_evidencias?: string | null
          id?: string
          id_competencia: string
          id_contrato: string
          id_execucao: string
          id_organizacao: string
          id_requisito: string
          justificativa?: string | null
          metadados?: Json
          resultado: string
        }
        Update: {
          confianca?: number | null
          criado_em?: string
          fundamento?: string | null
          hash_evidencias?: string | null
          id?: string
          id_competencia?: string
          id_contrato?: string
          id_execucao?: string
          id_organizacao?: string
          id_requisito?: string
          justificativa?: string | null
          metadados?: Json
          resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_b351bc6e038d"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "resultados_requisitos_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_requisitos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_requisitos_id_execucao_fkey"
            columns: ["id_execucao"]
            isOneToOne: false
            referencedRelation: "execucoes_analise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_requisitos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_requisitos_id_requisito_fkey"
            columns: ["id_requisito"]
            isOneToOne: false
            referencedRelation: "requisitos_competencia"
            referencedColumns: ["id"]
          },
        ]
      }
      retornos_modelo: {
        Row: {
          criado_em: string
          fontes: Json
          id: string
          id_consulta: string | null
          id_contrato: string | null
          id_execucao_analise: string | null
          id_organizacao: string
          modelo: string | null
          prompt_versao: string | null
          provedor: string | null
          resposta: Json
          status: string
          uso_tokens: Json
        }
        Insert: {
          criado_em?: string
          fontes?: Json
          id?: string
          id_consulta?: string | null
          id_contrato?: string | null
          id_execucao_analise?: string | null
          id_organizacao: string
          modelo?: string | null
          prompt_versao?: string | null
          provedor?: string | null
          resposta: Json
          status?: string
          uso_tokens?: Json
        }
        Update: {
          criado_em?: string
          fontes?: Json
          id?: string
          id_consulta?: string | null
          id_contrato?: string | null
          id_execucao_analise?: string | null
          id_organizacao?: string
          modelo?: string | null
          prompt_versao?: string | null
          provedor?: string | null
          resposta?: Json
          status?: string
          uso_tokens?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_511c5b7a8f94"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "retornos_modelo_id_consulta_fkey"
            columns: ["id_consulta"]
            isOneToOne: false
            referencedRelation: "consultas_semanticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retornos_modelo_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retornos_modelo_id_execucao_analise_fkey"
            columns: ["id_execucao_analise"]
            isOneToOne: false
            referencedRelation: "execucoes_analise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retornos_modelo_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      revisoes_regras_preventivas: {
        Row: {
          data: string
          decisao: string
          fundamento: string
          id: string
          id_contrato: string | null
          id_organizacao: string
          id_regra: string
          revisor: string | null
          snapshot: Json
          versao: number
        }
        Insert: {
          data?: string
          decisao: string
          fundamento: string
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          id_regra: string
          revisor?: string | null
          snapshot?: Json
          versao: number
        }
        Update: {
          data?: string
          decisao?: string
          fundamento?: string
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          id_regra?: string
          revisor?: string | null
          snapshot?: Json
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_0a2f75dfc63b"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "revisoes_regras_preventivas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisoes_regras_preventivas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisoes_regras_preventivas_id_regra_fkey"
            columns: ["id_regra"]
            isOneToOne: false
            referencedRelation: "regras_preventivas"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_corporativos: {
        Row: {
          atualizado_em: string
          categoria: string | null
          codigo: string
          criado_em: string
          descricao: string | null
          exposicao: number | null
          fontes: Json
          id: string
          id_entidade_organizacional: string | null
          id_organizacao: string
          impacto: number | null
          nivel: string
          prazo: string | null
          probabilidade: number | null
          responsavel: string | null
          status: string
          titulo: string
          tratamento: string | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          codigo: string
          criado_em?: string
          descricao?: string | null
          exposicao?: number | null
          fontes?: Json
          id?: string
          id_entidade_organizacional?: string | null
          id_organizacao: string
          impacto?: number | null
          nivel?: string
          prazo?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          status?: string
          titulo: string
          tratamento?: string | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          codigo?: string
          criado_em?: string
          descricao?: string | null
          exposicao?: number | null
          fontes?: Json
          id?: string
          id_entidade_organizacional?: string | null
          id_organizacao?: string
          impacto?: number | null
          nivel?: string
          prazo?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          status?: string
          titulo?: string
          tratamento?: string | null
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "riscos_corporativos_id_entidade_organizacional_fkey"
            columns: ["id_entidade_organizacional"]
            isOneToOne: false
            referencedRelation: "entidades_organizacionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_corporativos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_copiloto: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          escopo: Json
          id: string
          id_contrato: string | null
          id_organizacao: string
          status: string
          titulo: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          escopo?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao: string
          status?: string
          titulo?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          escopo?: Json
          id?: string
          id_contrato?: string | null
          id_organizacao?: string
          status?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_1678938ca61f"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "sessoes_copiloto_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_copiloto_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      similaridades_precedentes: {
        Row: {
          contraditorio: boolean
          criado_em: string
          data_contexto: string | null
          escopo_resultado: string | null
          forca_precedente: number | null
          id: string
          id_consulta: string
          id_contrato: string | null
          id_organizacao: string
          id_precedente: string
          metadados: Json
          modelo: string | null
          posicao_escopo: number | null
          score: number
          score_final: number | null
          similaridade_vetorial: number | null
        }
        Insert: {
          contraditorio?: boolean
          criado_em?: string
          data_contexto?: string | null
          escopo_resultado?: string | null
          forca_precedente?: number | null
          id?: string
          id_consulta: string
          id_contrato?: string | null
          id_organizacao: string
          id_precedente: string
          metadados?: Json
          modelo?: string | null
          posicao_escopo?: number | null
          score: number
          score_final?: number | null
          similaridade_vetorial?: number | null
        }
        Update: {
          contraditorio?: boolean
          criado_em?: string
          data_contexto?: string | null
          escopo_resultado?: string | null
          forca_precedente?: number | null
          id?: string
          id_consulta?: string
          id_contrato?: string | null
          id_organizacao?: string
          id_precedente?: string
          metadados?: Json
          modelo?: string | null
          posicao_escopo?: number | null
          score?: number
          score_final?: number | null
          similaridade_vetorial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_8c96f905d8f9"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "similaridades_precedentes_id_consulta_fkey"
            columns: ["id_consulta"]
            isOneToOne: false
            referencedRelation: "consultas_semanticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similaridades_precedentes_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similaridades_precedentes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similaridades_precedentes_id_precedente_fkey"
            columns: ["id_precedente"]
            isOneToOne: false
            referencedRelation: "precedentes"
            referencedColumns: ["id"]
          },
        ]
      }
      sugestoes_extracao_documento: {
        Row: {
          categoria_sugerida: string | null
          confianca: number | null
          conteudo: string
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_requisito_sugerido: string | null
          id_versao_documento: string
          metadados: Json
          pagina: number | null
          revisado_em: string | null
          revisado_por: string | null
          status: string
          tipo: string
          trecho_fonte: string | null
        }
        Insert: {
          categoria_sugerida?: string | null
          confianca?: number | null
          conteudo: string
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_requisito_sugerido?: string | null
          id_versao_documento: string
          metadados?: Json
          pagina?: number | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string
          tipo: string
          trecho_fonte?: string | null
        }
        Update: {
          categoria_sugerida?: string | null
          confianca?: number | null
          conteudo?: string
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_requisito_sugerido?: string | null
          id_versao_documento?: string
          metadados?: Json
          pagina?: number | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string
          tipo?: string
          trecho_fonte?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_bf414d4d8247"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "sugestoes_extracao_documento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_extracao_documento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_extracao_documento_id_requisito_sugerido_fkey"
            columns: ["id_requisito_sugerido"]
            isOneToOne: false
            referencedRelation: "requisitos_competencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_extracao_documento_id_versao_documento_fkey"
            columns: ["id_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_alerta: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string
          id: string
          id_alerta: string
          id_contrato: string
          id_organizacao: string
          prazo: string | null
          responsavel: string | null
          status: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao: string
          id?: string
          id_alerta: string
          id_contrato: string
          id_organizacao: string
          prazo?: string | null
          responsavel?: string | null
          status?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string
          id?: string
          id_alerta?: string
          id_contrato?: string
          id_organizacao?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_0d9827b219f7"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "tarefas_alerta_id_alerta_fkey"
            columns: ["id_alerta"]
            isOneToOne: false
            referencedRelation: "alertas_preventivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_alerta_id_alerta_fkey"
            columns: ["id_alerta"]
            isOneToOne: false
            referencedRelation: "v_central_excecoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_alerta_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_alerta_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_diligencia: {
        Row: {
          atualizado_em: string
          criado_em: string
          depende_de: string[]
          descricao: string
          id: string
          id_apontamento: string | null
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_evidencia_versao_documento: string | null
          id_organizacao: string
          id_plano: string | null
          prazo: string | null
          prioridade: string
          responsavel: string | null
          status: string
          tipo_acao: string | null
          validacao_solucao: string
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          depende_de?: string[]
          descricao: string
          id?: string
          id_apontamento?: string | null
          id_ciclo: string
          id_competencia: string
          id_contrato: string
          id_evidencia_versao_documento?: string | null
          id_organizacao: string
          id_plano?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          tipo_acao?: string | null
          validacao_solucao?: string
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          depende_de?: string[]
          descricao?: string
          id?: string
          id_apontamento?: string | null
          id_ciclo?: string
          id_competencia?: string
          id_contrato?: string
          id_evidencia_versao_documento?: string | null
          id_organizacao?: string
          id_plano?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          tipo_acao?: string | null
          validacao_solucao?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_2dd526818c7d"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_apontamento_fkey"
            columns: ["id_apontamento"]
            isOneToOne: false
            referencedRelation: "apontamentos_contratante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_ciclo_fkey"
            columns: ["id_ciclo"]
            isOneToOne: false
            referencedRelation: "ciclos_diligencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_competencia_fkey"
            columns: ["id_competencia"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_evidencia_versao_documento_fkey"
            columns: ["id_evidencia_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_diligencia_id_plano_fkey"
            columns: ["id_plano"]
            isOneToOne: false
            referencedRelation: "planos_acao"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          conta_bancaria: string | null
          criado_em: string
          dados_brutos: Json
          data: string
          descricao: string
          documento: string | null
          fornecedor_documento_original: string | null
          fornecedor_nome_original: string | null
          hash_origem: string
          id: string
          id_contrato: string
          id_fornecedor: string | null
          id_importacao: string | null
          id_linha_orcamentaria: string | null
          id_organizacao: string
          pre_validada: boolean
          pre_validada_em: string | null
          status_fluxo: string
          tipo: string
          valor: number
        }
        Insert: {
          conta_bancaria?: string | null
          criado_em?: string
          dados_brutos?: Json
          data: string
          descricao: string
          documento?: string | null
          fornecedor_documento_original?: string | null
          fornecedor_nome_original?: string | null
          hash_origem: string
          id?: string
          id_contrato: string
          id_fornecedor?: string | null
          id_importacao?: string | null
          id_linha_orcamentaria?: string | null
          id_organizacao: string
          pre_validada?: boolean
          pre_validada_em?: string | null
          status_fluxo?: string
          tipo: string
          valor: number
        }
        Update: {
          conta_bancaria?: string | null
          criado_em?: string
          dados_brutos?: Json
          data?: string
          descricao?: string
          documento?: string | null
          fornecedor_documento_original?: string | null
          fornecedor_nome_original?: string | null
          hash_origem?: string
          id?: string
          id_contrato?: string
          id_fornecedor?: string | null
          id_importacao?: string | null
          id_linha_orcamentaria?: string | null
          id_organizacao?: string
          pre_validada?: boolean
          pre_validada_em?: string | null
          status_fluxo?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c1a904551131"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_fornecedor_fkey"
            columns: ["id_fornecedor"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_importacao_fkey"
            columns: ["id_importacao"]
            isOneToOne: false
            referencedRelation: "importacoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_linha_orcamentaria_fkey"
            columns: ["id_linha_orcamentaria"]
            isOneToOne: false
            referencedRelation: "linhas_orcamentarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos_alertas: {
        Row: {
          criado_em: string
          decisao: string
          fundamento: string
          id: string
          id_alerta: string
          id_contrato: string
          id_evidencia_versao_documento: string | null
          id_organizacao: string
          tratado_em: string
          tratado_por: string | null
        }
        Insert: {
          criado_em?: string
          decisao: string
          fundamento: string
          id?: string
          id_alerta: string
          id_contrato: string
          id_evidencia_versao_documento?: string | null
          id_organizacao: string
          tratado_em?: string
          tratado_por?: string | null
        }
        Update: {
          criado_em?: string
          decisao?: string
          fundamento?: string
          id?: string
          id_alerta?: string
          id_contrato?: string
          id_evidencia_versao_documento?: string | null
          id_organizacao?: string
          tratado_em?: string
          tratado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_4a77f044c7ea"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "tratamentos_alertas_id_alerta_fkey"
            columns: ["id_alerta"]
            isOneToOne: false
            referencedRelation: "alertas_preventivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_alertas_id_alerta_fkey"
            columns: ["id_alerta"]
            isOneToOne: false
            referencedRelation: "v_central_excecoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_alertas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_alertas_id_evidencia_versao_documento_fkey"
            columns: ["id_evidencia_versao_documento"]
            isOneToOne: false
            referencedRelation: "versoes_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_alertas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          atualizado_em: string
          criado_em: string
          email: string | null
          id_usuario: string
          nome: string | null
          situacao: string
          telefone: string | null
          versao_registro: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id_usuario: string
          nome?: string | null
          situacao?: string
          telefone?: string | null
          versao_registro?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id_usuario?: string
          nome?: string | null
          situacao?: string
          telefone?: string | null
          versao_registro?: number
        }
        Relationships: []
      }
      versoes_contrato: {
        Row: {
          criado_em: string
          criado_por: string | null
          hash: string
          id: string
          id_contrato: string
          id_organizacao: string
          motivo: string | null
          numero_versao: number
          snapshot: Json
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          hash: string
          id?: string
          id_contrato: string
          id_organizacao: string
          motivo?: string | null
          numero_versao: number
          snapshot: Json
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          hash?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          motivo?: string | null
          numero_versao?: number
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_b32ff801a1fe"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_contrato_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_contrato_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      versoes_controle: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string
          criterios: Json
          eventos_gatilho: string[]
          evidencia_requerida: Json
          hash: string
          id: string
          id_controle: string
          id_organizacao: string
          status: string
          texto: string
          versao: number
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criterios?: Json
          eventos_gatilho?: string[]
          evidencia_requerida?: Json
          hash: string
          id?: string
          id_controle: string
          id_organizacao: string
          status?: string
          texto: string
          versao: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          criterios?: Json
          eventos_gatilho?: string[]
          evidencia_requerida?: Json
          hash?: string
          id?: string
          id_controle?: string
          id_organizacao?: string
          status?: string
          texto?: string
          versao?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "versoes_controle_id_controle_fkey"
            columns: ["id_controle"]
            isOneToOne: false
            referencedRelation: "controles_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_controle_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      versoes_documento: {
        Row: {
          criado_em: string
          enviado_por: string | null
          hash: string
          id: string
          id_arquivo: string
          id_contrato: string
          id_documento: string | null
          id_documento_competencia: string | null
          id_documento_contrato: string | null
          id_organizacao: string
          metadados_extraidos: Json
          motivo_substituicao: string | null
          numero_versao: number
        }
        Insert: {
          criado_em?: string
          enviado_por?: string | null
          hash: string
          id?: string
          id_arquivo: string
          id_contrato: string
          id_documento?: string | null
          id_documento_competencia?: string | null
          id_documento_contrato?: string | null
          id_organizacao: string
          metadados_extraidos?: Json
          motivo_substituicao?: string | null
          numero_versao: number
        }
        Update: {
          criado_em?: string
          enviado_por?: string | null
          hash?: string
          id?: string
          id_arquivo?: string
          id_contrato?: string
          id_documento?: string | null
          id_documento_competencia?: string | null
          id_documento_contrato?: string | null
          id_organizacao?: string
          metadados_extraidos?: Json
          motivo_substituicao?: string | null
          numero_versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_c5e0289c50a5"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_documento_arquivo_org_contrato_fk"
            columns: ["id_arquivo", "id_organizacao", "id_contrato"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao", "id_contrato"]
          },
          {
            foreignKeyName: "versoes_documento_arquivo_org_fk"
            columns: ["id_arquivo", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_documento_id_arquivo_fkey"
            columns: ["id_arquivo"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_documento_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_documento_id_documento_competencia_fkey"
            columns: ["id_documento_competencia"]
            isOneToOne: false
            referencedRelation: "documentos_competencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_documento_id_documento_contrato_fkey"
            columns: ["id_documento_contrato"]
            isOneToOne: false
            referencedRelation: "documentos_contrato"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_documento_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      versoes_fontes_normativas: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          conteudo_texto: string | null
          criado_em: string
          fim_vigencia: string | null
          hash: string
          id: string
          id_arquivo: string | null
          id_contrato: string | null
          id_fonte: string
          id_organizacao: string
          inicio_vigencia: string | null
          metadados: Json
          versao: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          conteudo_texto?: string | null
          criado_em?: string
          fim_vigencia?: string | null
          hash: string
          id?: string
          id_arquivo?: string | null
          id_contrato?: string | null
          id_fonte: string
          id_organizacao: string
          inicio_vigencia?: string | null
          metadados?: Json
          versao: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          conteudo_texto?: string | null
          criado_em?: string
          fim_vigencia?: string | null
          hash?: string
          id?: string
          id_arquivo?: string | null
          id_contrato?: string | null
          id_fonte?: string
          id_organizacao?: string
          inicio_vigencia?: string | null
          metadados?: Json
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_722578b7c8eb"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_fontes_normativas_arquivo_org_contrato_fk"
            columns: ["id_arquivo", "id_organizacao", "id_contrato"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao", "id_contrato"]
          },
          {
            foreignKeyName: "versoes_fontes_normativas_arquivo_org_fk"
            columns: ["id_arquivo", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "arquivos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_fontes_normativas_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_fontes_normativas_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fontes_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_fontes_normativas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      versoes_lista: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string
          id: string
          id_contrato: string
          id_lista: string
          id_organizacao: string
          numero_versao: number
          situacao: string
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          id?: string
          id_contrato: string
          id_lista: string
          id_organizacao: string
          numero_versao: number
          situacao?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          id?: string
          id_contrato?: string
          id_lista?: string
          id_organizacao?: string
          numero_versao?: number
          situacao?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_9f9c207b589b"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_lista_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_lista_id_lista_fkey"
            columns: ["id_lista"]
            isOneToOne: false
            referencedRelation: "listas_verificacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_lista_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      versoes_proposta: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string
          hash: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_proposta: string
          numero_versao: number
          situacao: string
          valor_total: number
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          hash: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_proposta: string
          numero_versao: number
          situacao?: string
          valor_total?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string
          hash?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_proposta?: string
          numero_versao?: number
          situacao?: string
          valor_total?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_contract_83af1e016f6f"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "versoes_proposta_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_proposta_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versoes_proposta_id_proposta_fkey"
            columns: ["id_proposta"]
            isOneToOne: false
            referencedRelation: "propostas_orcamentarias"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos_usuario_contratos: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          id_contrato: string
          id_organizacao: string
          id_vinculo_usuario: string
          revogado_em: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          id_contrato: string
          id_organizacao: string
          id_vinculo_usuario: string
          revogado_em?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          id_contrato?: string
          id_organizacao?: string
          id_vinculo_usuario?: string
          revogado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_usuario_contratos_contrato_org_fk"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "vinculos_usuario_contratos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_usuario_contratos_id_vinculo_usuario_fkey"
            columns: ["id_vinculo_usuario"]
            isOneToOne: false
            referencedRelation: "vinculos_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_usuario_contratos_vinculo_org_fk"
            columns: ["id_vinculo_usuario", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "vinculos_usuarios"
            referencedColumns: ["id", "id_organizacao"]
          },
        ]
      }
      vinculos_usuarios: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          escopo_todos_contratos: boolean
          fim_em: string | null
          id: string
          id_organizacao: string
          id_usuario: string
          inicio_em: string
          perfil: string
          versao_registro: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          escopo_todos_contratos?: boolean
          fim_em?: string | null
          id?: string
          id_organizacao: string
          id_usuario: string
          inicio_em?: string
          perfil: string
          versao_registro?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          escopo_todos_contratos?: boolean
          fim_em?: string | null
          id?: string
          id_organizacao?: string
          id_usuario?: string
          inicio_em?: string
          perfil?: string
          versao_registro?: number
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_usuarios_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_usuarios_perfil_fkey"
            columns: ["perfil"]
            isOneToOne: false
            referencedRelation: "perfis_usuarios"
            referencedColumns: ["codigo"]
          },
        ]
      }
      webhooks: {
        Row: {
          ativo: boolean
          atualizado_em: string
          circuito_aberto_ate: string | null
          criado_em: string
          criado_por: string | null
          eventos: string[]
          falhas_consecutivas: number
          headers_publicos: Json
          id: string
          id_organizacao: string
          nome: string | null
          rotacionado_em: string | null
          secret_hash: string
          url: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          circuito_aberto_ate?: string | null
          criado_em?: string
          criado_por?: string | null
          eventos?: string[]
          falhas_consecutivas?: number
          headers_publicos?: Json
          id?: string
          id_organizacao: string
          nome?: string | null
          rotacionado_em?: string | null
          secret_hash: string
          url: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          circuito_aberto_ate?: string | null
          criado_em?: string
          criado_por?: string | null
          eventos?: string[]
          falhas_consecutivas?: number
          headers_publicos?: Json
          id?: string
          id_organizacao?: string
          nome?: string | null
          rotacionado_em?: string | null
          secret_hash?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_central_excecoes_financeiras: {
        Row: {
          codigo_regra: string | null
          criado_em: string | null
          data: string | null
          descricao: string | null
          descricao_transacao: string | null
          documento: string | null
          evidencias_futuras: Json | null
          grupo_chave: string | null
          id: string | null
          id_contrato: string | null
          id_fornecedor: string | null
          id_organizacao: string | null
          id_transacao: string | null
          impacto_financeiro: number | null
          quantidade_agrupada: number | null
          regra: string | null
          responsavel: string | null
          severidade: string | null
          status: string | null
          valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_preventivos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_preventivos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_preventivos_id_transacao_fkey"
            columns: ["id_transacao"]
            isOneToOne: false
            referencedRelation: "transacoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_contract_2595b3b2e5bd"
            columns: ["id_contrato", "id_organizacao"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id", "id_organizacao"]
          },
          {
            foreignKeyName: "transacoes_financeiras_id_fornecedor_fkey"
            columns: ["id_fornecedor"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      adicionar_versao_documento_competencia: {
        Args: { p_id_arquivo: string; p_id_documento: string; p_motivo: string }
        Returns: string
      }
      agora_brasilia: { Args: never; Returns: string }
      api_autenticar_cliente: {
        Args: { p_escopo: string; p_identificador: string; p_secret: string }
        Returns: Json
      }
      aprovar_apresentacao: {
        Args: { p_fundamento?: string; p_id_competencia: string }
        Returns: Json
      }
      aprovar_avaliacao_impacto: {
        Args: {
          p_aprovar: boolean
          p_decisao: string
          p_fundamento: string
          p_id_avaliacao: string
        }
        Returns: undefined
      }
      aprovar_contestacao: {
        Args: {
          p_aprovar: boolean
          p_fundamento?: string
          p_id_contestacao: string
        }
        Returns: undefined
      }
      aprovar_excecao_controle: {
        Args: { p_aprovar: boolean; p_id_excecao: string }
        Returns: undefined
      }
      aprovar_parecer_interno: {
        Args: {
          p_aprovar: boolean
          p_fundamento?: string
          p_id_parecer: string
        }
        Returns: undefined
      }
      aprovar_regra_preventiva: {
        Args: { p_id_regra_preventiva: string; p_parecer?: string }
        Returns: string
      }
      aprovar_versao_fonte_v107: {
        Args: {
          p_chave_idempotencia: string
          p_fundamento: string
          p_hash_esperado: string
          p_id_organizacao: string
          p_id_versao: string
        }
        Returns: Json
      }
      atribuir_alerta_preventivo: {
        Args: { p_id_alerta: string; p_prazo?: string; p_responsavel: string }
        Returns: string
      }
      atualizar_contratante: {
        Args: {
          p_contato: Json
          p_documento: string
          p_id_contratante: string
          p_id_organizacao: string
          p_nome_fantasia: string
          p_razao_social: string
          p_situacao: string
          p_tipo_pessoa: string
          p_versao_esperada: number
        }
        Returns: Json
      }
      atualizar_tarefa_diligencia: {
        Args: {
          p_descricao?: string
          p_id_tarefa: string
          p_prazo?: string
          p_responsavel?: string
        }
        Returns: undefined
      }
      avaliar_portao_conformidade: {
        Args: { p_id_competencia: string }
        Returns: Json
      }
      avaliar_portao_reapresentacao: {
        Args: { p_id_ciclo: string }
        Returns: Json
      }
      classificar_acesso_contrato_v106: {
        Args: { p_id_contrato: string }
        Returns: string
      }
      concluir_plano_remediacao: {
        Args: { p_evidencias: Json; p_id_plano: string }
        Returns: undefined
      }
      concluir_tarefa_diligencia: {
        Args: { p_id_evidencia_versao_documento: string; p_id_tarefa: string }
        Returns: undefined
      }
      confirmar_upload_arquivo: {
        Args: {
          p_id_contrato: string
          p_id_organizacao: string
          p_mime: string
          p_nome_original: string
          p_origem?: string
          p_path: string
          p_sha256: string
          p_tamanho: number
        }
        Returns: string
      }
      criar_acesso_temporario_pacote: {
        Args: {
          p_descricao_destinatario?: string
          p_expira_em: string
          p_id_pacote: string
          p_max_acessos?: number
        }
        Returns: Json
      }
      criar_cliente_api: {
        Args: { p_escopos?: string[]; p_id_organizacao: string; p_nome: string }
        Returns: Json
      }
      criar_competencia: {
        Args: {
          p_competencia_referencia: string
          p_data_limite?: string
          p_id_contrato: string
          p_periodo_fim?: string
          p_periodo_inicio?: string
        }
        Returns: string
      }
      criar_contestacao: {
        Args: {
          p_evidencias?: Json
          p_fundamento: string
          p_id_apontamento: string
          p_texto: string
        }
        Returns: string
      }
      criar_documento_competencia: {
        Args: {
          p_categoria: string
          p_id_arquivo: string
          p_id_competencia: string
          p_id_requisito: string
          p_tipo: string
          p_titulo: string
        }
        Returns: string
      }
      criar_organizacao: {
        Args: {
          p_cnpj?: string
          p_nome_fantasia?: string
          p_razao_social: string
          p_timezone?: string
        }
        Returns: string
      }
      criar_pacote_evidencias: {
        Args: {
          p_escopo: Json
          p_expira_em?: string
          p_id_contrato: string
          p_id_organizacao: string
        }
        Returns: string
      }
      criar_webhook: {
        Args: {
          p_eventos: string[]
          p_id_organizacao: string
          p_nome: string
          p_url: string
        }
        Returns: Json
      }
      definir_acesso_contrato_usuario: {
        Args: {
          p_conceder?: boolean
          p_id_contrato: string
          p_id_organizacao: string
          p_id_usuario: string
        }
        Returns: undefined
      }
      definir_aplicabilidade_fonte_v107: {
        Args: {
          p_aplicavel: boolean
          p_atualizado_em_esperado: string
          p_chave_idempotencia: string
          p_fundamento: string
          p_id_contrato: string
          p_id_organizacao: string
          p_id_versao: string
        }
        Returns: Json
      }
      definir_vinculo_usuario: {
        Args: {
          p_ativo?: boolean
          p_escopo_todos_contratos?: boolean
          p_id_organizacao: string
          p_id_usuario: string
          p_perfil: string
        }
        Returns: string
      }
      encerrar_nao_conformidade: {
        Args: { p_fundamento: string; p_id_nao_conformidade: string }
        Returns: undefined
      }
      enfileirar_evento_webhook: {
        Args: {
          p_entidade_id: string
          p_entidade_tipo: string
          p_evento: string
          p_id_webhook: string
          p_payload_ref: Json
        }
        Returns: string
      }
      enfileirar_processamento_documento: {
        Args: { p_chave_idempotencia?: string; p_id_versao_documento: string }
        Returns: string
      }
      formatar_data_br: { Args: { p_data: string }; Returns: string }
      formatar_data_hora_br: { Args: { p_data_hora: string }; Returns: string }
      formatar_hora_br: { Args: { p_data_hora: string }; Returns: string }
      iniciar_consulta_copiloto: {
        Args: {
          p_filtros?: Json
          p_id_contrato: string
          p_id_sessao: string
          p_modelo?: string
          p_texto: string
        }
        Returns: Json
      }
      liberar_reapresentacao: {
        Args: { p_fundamento?: string; p_id_ciclo: string }
        Returns: Json
      }
      listar_auditoria_vinculo_usuario_adm: {
        Args: {
          p_id_organizacao: string
          p_id_usuario: string
          p_pagina?: number
          p_tamanho_pagina?: number
        }
        Returns: Json
      }
      listar_escopo_contratos_usuario_adm: {
        Args: {
          p_busca?: string
          p_id_organizacao: string
          p_id_usuario: string
          p_pagina?: number
          p_tamanho_pagina?: number
        }
        Returns: Json
      }
      listar_organizacoes_disponiveis: {
        Args: never
        Returns: {
          cnpj: string
          id: string
          nome_fantasia: string
          perfil: string
          razao_social: string
          situacao: string
        }[]
      }
      listar_usuarios_vinculos_adm: {
        Args: {
          p_ativo?: boolean
          p_busca?: string
          p_id_organizacao: string
          p_pagina?: number
          p_tamanho_pagina?: number
        }
        Returns: Json
      }
      normalizar_erro_backend: {
        Args: { p_codigo_sql: string; p_mensagem_tecnica?: string }
        Returns: Json
      }
      normalizar_paginacao: {
        Args: { p_pagina?: number; p_tamanho?: number }
        Returns: Json
      }
      obter_mensagem_sistema: { Args: { p_codigo: string }; Returns: Json }
      obter_resumo_dashboard: {
        Args: { p_id_organizacao: string }
        Returns: Json
      }
      obter_saude_operacional: {
        Args: { p_id_organizacao: string }
        Returns: Json
      }
      promover_precedente_para_regra: {
        Args: {
          p_codigo_regra: string
          p_criticidade?: string
          p_descricao: string
          p_efeito?: string
          p_escopo_aplicacao?: string
          p_id_precedente: string
        }
        Returns: string
      }
      propor_regra_de_alerta_transversal: {
        Args: {
          p_codigo_regra: string
          p_criticidade?: string
          p_descricao: string
          p_efeito?: string
          p_id_alerta: string
          p_id_fonte_formal_versao: string
        }
        Returns: string
      }
      publicar_controle: {
        Args: {
          p_evidencia_requerida: Json
          p_id_controle: string
          p_texto: string
          p_vigencia_fim?: string
          p_vigencia_inicio: string
        }
        Returns: string
      }
      publicar_controle_conformidade: {
        Args: {
          p_evidencia_requerida: Json
          p_id_controle: string
          p_texto: string
          p_vigencia_fim?: string
          p_vigencia_inicio: string
        }
        Returns: string
      }
      publicar_regra_candidata: {
        Args: {
          p_id_avaliacao_impacto: string
          p_id_regra_candidata: string
          p_vigencia_fim?: string
          p_vigencia_inicio: string
        }
        Returns: string
      }
      recalcular_inteligencia_historica: {
        Args: { p_id_contratante: string }
        Returns: Json
      }
      registrar_apontamento_contratante: {
        Args: {
          p_codigo?: string
          p_descricao: string
          p_fonte_pagina?: number
          p_fonte_trecho?: string
          p_fundamento?: string
          p_id_ciclo: string
          p_severidade?: string
        }
        Returns: string
      }
      registrar_apresentacao: {
        Args: {
          p_forma_apresentacao?: string
          p_id_competencia: string
          p_id_comprovante_arquivo?: string
          p_idempotency_key: string
          p_protocolo?: string
        }
        Returns: string
      }
      registrar_desfecho_contestacao: {
        Args: {
          p_id_contestacao: string
          p_resultado: string
          p_texto?: string
        }
        Returns: string
      }
      registrar_parecer_contratante: {
        Args: {
          p_data_emissao?: string
          p_id_apresentacao: string
          p_id_arquivo: string
          p_id_competencia: string
          p_numero_documento?: string
          p_parecer_final_favoravel?: boolean
          p_prazo_resposta?: string
          p_resultado_geral: string
        }
        Returns: string
      }
      registrar_reapresentacao: {
        Args: {
          p_forma_apresentacao?: string
          p_id_ciclo: string
          p_id_comprovante_arquivo?: string
          p_idempotency_key: string
          p_protocolo?: string
        }
        Returns: string
      }
      registrar_resultado_requisito: {
        Args: {
          p_evidencias?: Json
          p_fundamento?: string
          p_id_execucao: string
          p_id_requisito: string
          p_justificativa?: string
          p_resultado: string
        }
        Returns: string
      }
      registrar_versao_fonte_v107: {
        Args: {
          p_chave_idempotencia: string
          p_conteudo_texto: string
          p_fim_vigencia: string
          p_id_arquivo: string
          p_id_fonte: string
          p_id_organizacao: string
          p_inicio_vigencia: string
          p_metadados: Json
        }
        Returns: Json
      }
      revisar_solucao_tarefa_diligencia: {
        Args: { p_aprovar: boolean; p_fundamento: string; p_id_tarefa: string }
        Returns: Json
      }
      revisar_sugestao_extracao: {
        Args: {
          p_aprovar: boolean
          p_categoria_revisada?: string
          p_conteudo_revisado?: string
          p_id_requisito_revisado?: string
          p_id_sugestao: string
        }
        Returns: Json
      }
      revogar_acesso_temporario_pacote: {
        Args: { p_fundamento: string; p_id_acesso: string }
        Returns: undefined
      }
      rotacionar_cliente_api: { Args: { p_id_cliente: string }; Returns: Json }
      rotacionar_webhook: { Args: { p_id_webhook: string }; Returns: Json }
      salvar_fonte_normativa_v107: {
        Args: {
          p_chave_idempotencia: string
          p_descricao: string
          p_id_contrato: string
          p_id_fonte: string
          p_id_organizacao: string
          p_referencia: string
          p_situacao: string
          p_tipo: string
          p_titulo: string
          p_versao_esperada: number
        }
        Returns: Json
      }
      salvar_vinculo_usuario_adm: {
        Args: {
          p_ativo: boolean
          p_chave_idempotencia: string
          p_email: string
          p_escopo_todos_contratos: boolean
          p_id_organizacao: string
          p_id_usuario: string
          p_ids_contratos_ativar: string[]
          p_ids_contratos_revogar: string[]
          p_perfil: string
          p_versao_esperada: number
        }
        Returns: Json
      }
      solicitar_analise_competencia: {
        Args: { p_id_competencia: string; p_tipo?: string }
        Returns: string
      }
      solicitar_avaliacao_impacto_normativo: {
        Args: { p_id_alteracao: string }
        Returns: string
      }
      solicitar_importacao_financeira: {
        Args: {
          p_chave_deduplicacao: string
          p_hash: string
          p_id_arquivo: string
          p_id_fonte: string
        }
        Returns: string
      }
      solicitar_minuta_contestacao: {
        Args: { p_id_apontamento: string }
        Returns: string
      }
      solicitar_parecer_interno: {
        Args: { p_id_competencia: string }
        Returns: string
      }
      solicitar_reanalise_requisitos: {
        Args: { p_id_competencia: string; p_requisitos: string[] }
        Returns: string
      }
      tratar_alerta_preventivo: {
        Args: {
          p_decisao: string
          p_fundamento: string
          p_id_alerta: string
          p_id_evidencia_versao_documento?: string
        }
        Returns: string
      }
      validar_acesso_temporario_pacote: {
        Args: {
          p_ip_hash?: string
          p_token: string
          p_user_agent_hash?: string
        }
        Returns: Json
      }
      validar_administrador_organizacao: {
        Args: { p_id_organizacao: string }
        Returns: boolean
      }
      validar_remediacao: {
        Args: { p_aprovar: boolean; p_fundamento: string; p_id_plano: string }
        Returns: undefined
      }
      validar_token_interno: { Args: { p_token: string }; Returns: boolean }
      validar_transacao_preventivamente: {
        Args: { p_id_transacao: string }
        Returns: Json
      }
      vincular_fonte_formal_regra: {
        Args: {
          p_fundamento: string
          p_id_contrato: string
          p_id_regra: string
          p_id_versao_fonte: string
        }
        Returns: string
      }
      worker_buscar_fragmentos: {
        Args: {
          p_embedding: string
          p_id_contrato: string
          p_id_organizacao: string
          p_limite?: number
        }
        Returns: {
          id: string
          id_versao_documento: string
          pagina_fim: number
          pagina_inicio: number
          similaridade: number
          texto: string
        }[]
      }
      worker_buscar_fragmentos_temporais: {
        Args: {
          p_data_referencia?: string
          p_embedding: string
          p_id_contrato: string
          p_id_organizacao: string
          p_limite?: number
        }
        Returns: {
          fim_vigencia: string
          fonte_temporal: string
          id: string
          id_versao_documento: string
          inicio_vigencia: string
          pagina_fim: number
          pagina_inicio: number
          similaridade: number
          texto: string
        }[]
      }
      worker_buscar_precedentes: {
        Args: {
          p_embedding: string
          p_id_contratante: string
          p_id_contrato: string
          p_id_organizacao: string
          p_limite?: number
        }
        Returns: {
          competencia_origem: string
          desfecho: string
          id: string
          id_contrato_origem: string
          mesmo_contrato: boolean
          problema: string
          similaridade: number
          solucao: string
        }[]
      }
      worker_buscar_precedentes_ranqueados: {
        Args: {
          p_embedding: string
          p_id_contratante: string
          p_id_contrato: string
          p_id_organizacao: string
          p_limite?: number
        }
        Returns: {
          competencia_origem: string
          confianca: number
          confirmacoes: number
          desfecho: string
          escopo_resultado: string
          forca_score: number
          hierarquia_normativa: number
          id: string
          id_contrato_origem: string
          problema: string
          score_final: number
          similaridade: number
          solucao: string
        }[]
      }
      worker_buscar_precedentes_v4: {
        Args: {
          p_data_contexto?: string
          p_embedding: string
          p_filtros?: Json
          p_id_contrato: string
          p_id_organizacao: string
          p_limite_por_escopo?: number
        }
        Returns: {
          categoria: string
          competencia_origem: string
          contraditorio: boolean
          desfecho: string
          documento_tipo: string
          escopo_resultado: string
          forca_precedente: number
          id: string
          id_contrato_origem: string
          id_relatorio_origem: string
          item_origem: string
          posicao_escopo: number
          problema: string
          rubrica: string
          score_final: number
          similaridade_vetorial: number
          solucao: string
          unidade_origem: string
        }[]
      }
      worker_contexto_normativo_temporal_v4: {
        Args: { p_data_contexto: string; p_id_contrato: string }
        Returns: {
          conteudo_texto: string
          fim_vigencia: string
          hash: string
          id_fonte: string
          id_versao: string
          inicio_vigencia: string
          referencia: string
          tipo: string
          titulo: string
          versao: number
        }[]
      }
      worker_enfileirar_job: {
        Args: {
          p_chave_idempotencia?: string
          p_entidade_id: string
          p_entidade_tipo: string
          p_fila: string
          p_id_contrato: string
          p_id_organizacao: string
          p_payload: Json
        }
        Returns: string
      }
      worker_exportar_historico_migrations: { Args: never; Returns: string }
      worker_finalizar_job: {
        Args: {
          p_erro_codigo?: string
          p_erro_detalhe?: string
          p_fila: string
          p_max_tentativas?: number
          p_msg_id: number
          p_sucesso: boolean
        }
        Returns: Json
      }
      worker_materializar_alertas_transversais_v4: {
        Args: {
          p_embedding: string
          p_filtros?: Json
          p_id_competencia: string
          p_limite?: number
        }
        Returns: number
      }
      worker_obter_contexto_documento: {
        Args: { p_id_versao: string }
        Returns: Json
      }
      worker_obter_webhook: { Args: { p_id_evento: string }; Returns: Json }
      worker_pull_job: {
        Args: { p_fila: string; p_visibility_seconds?: number }
        Returns: Json
      }
      worker_recalcular_inteligencia: {
        Args: { p_id_contratante: string }
        Returns: Json
      }
      worker_recalcular_perfil_contratante_v4: {
        Args: { p_id_contratante: string; p_id_organizacao: string }
        Returns: string
      }
      worker_registrar_entrega_webhook: {
        Args: {
          p_erro?: string
          p_id_evento: string
          p_resposta_hash?: string
          p_status_http: number
          p_sucesso: boolean
        }
        Returns: undefined
      }
      worker_validar_transacao_preventiva: {
        Args: { p_id_transacao: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
