\set ON_ERROR_STOP on
BEGIN;
DO $test$
BEGIN
 IF to_regprocedure('public.registrar_relatorio_historico_hml(uuid,date,text)') IS NULL THEN RAISE EXCEPTION 'Registro ausente'; END IF;
 IF to_regprocedure('public.enfileirar_ingestao_historica_hml(uuid,uuid)') IS NULL THEN RAISE EXCEPTION 'Fila ausente'; END IF;
 IF to_regprocedure('public.vincular_tratamento_historico_hml(uuid,text,text,text)') IS NULL THEN RAISE EXCEPTION 'Vinculo ausente'; END IF;
 IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='contaos-worker-historico-v1-22' AND active) THEN RAISE EXCEPTION 'Cron inativo'; END IF;
 RAISE NOTICE 'PASSOU: estrutura e cron';
END $test$;
ROLLBACK;
